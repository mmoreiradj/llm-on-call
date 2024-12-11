# Application Web Microservices avec Kubernetes & Helm

![Helm](./docs/img/Helm.avif)

Ce projet consiste à déployer une application web composée de trois services dans un cluster Kubernetes local. Voici les spécifications du projet :

## Architecture de l'application

1. **Aggregator API (gateway)**  
   - Service principal exposé au public.  
   - Reçoit des requêtes HTTP et interagit avec les deux microservices suivants.  
   - Compose une phrase en combinant les réponses des microservices.

2. **Microservice Names**  
   - Génère des noms aléatoires.  

3. **Microservice Verbs**  
   - Génère des verbes aléatoires.  
   - Génère des adverbes aléatoires.

## Create Helm Charts

1. Create chart for each service :

```bash
helm create gateway
helm create names-service
helm create verbes-service
```


## Déploiement K3D 

1. Créer un cluster K3D avec 3 noeuds :  
```bash
k3d cluster create ssi-cluster 
```

2. vérifier que le bon contexte est sélectionné :  
```bash
kubectl config current-context
```

3. Créer un namespace pour les services :  
```bash
kubectl create namespace ssi
kubectl create namespace kyverno
```

> **Note :** Les services seront déployés dans le namespace `ssi`.

4. Switcher vers le namespace `ssi` :    
```bash
kubectl config set-context --current --namespace=ssi
```
> **Note :** Les services seront déployés dans le namespace `ssi`.

5. Build des images Docker :  
```bash
docker compose build
```

6. Importer les images Docker dans le cluster :  
```bash
k3d image import -c ssi-cluster ssi-gateway:latest
k3d image import -c ssi-cluster ssi-names-service:latest
k3d image import -c ssi-cluster ssi-verbes-service:latest
```

7. Déployer les services :  
```bash
helmfile sync
```

![helmfile-sync](./docs/img/helmfile-sync.png)

8. Port-forwarding pour accéder à l'application :  
```bash
kubectl port-forward svc/gateway 3000:3000
```
> **Note :** L'application est accessible à l'adresse `http://localhost:3000`.
> Possible de `Shift+F` pour port-forwarding depuis K9S.

## Kyverno

### Admission Policies 

#!TODO: Ajouter SCREEN created policies

1. Pod(s) require name label [manifests/require-name-label.yaml](./kubernetes/manifests/require-name-label.yaml)

Cette politique Kyverno assure que tous les pods déployés dans le cluster Kubernetes possèdent une étiquette spécifique `app.kubernetes.io/name:`. Elle exclut les namespaces kube-system et kyverno de cette vérification.

En cas de non respect de cette politique, un pod sera refusé par le contrôleur d'admission Kyverno.

![label-blocked](./docs/img/label-blocked.png)

> **Note :** Pour reproduire l'erreur, il suffit de déployer un pod sans l'étiquette `app.kubernetes.io/name`. Pour cela commenter la ligne `app.kubernetes.io/name` dans le fichier [_helpers.tpl_](./kubernetes/charts/verbs-service/templates/_helpers.tpl). Puis, redeployer les services avec `helmfile sync`.

2. Disallow root user in containers [manifests/disallow-root-user.yaml](./kubernetes/manifests/disallow-root-user.yaml)

Cette politique Kyverno assure que les conteneurs déployés dans le cluster Kubernetes n'utilisent pas l'utilisateur `root`. En cas de non respect de cette politique, un pod sera refusé par le contrôleur d'admission Kyverno.

## Helmfile integration

Pour s'assurer que Kyverno est prêt avant de déployer les services, un script bash [kyverno-ready.sh](./kubernetes/scripts/kyverno-ready.sh) est exécuté afin de vérifier l'état des `ClusterPolicies`. Le script est exécuté automatiquement par Helmfile à l'aide d'un hook `postsync`.

**Exemple d'ouput :**  

![check-policies](./docs/img/check-policies-is-ready.png)

## Commandes utiles HELMFILE

- **Lister les releases :**  
```bash
helmfile list
```

- **Deployer/Supprimer une release en particulier :**  
```bash
helmfile -l name=<release-name> <sync|delete>
```