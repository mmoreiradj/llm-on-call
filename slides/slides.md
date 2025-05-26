---
theme: seriph
background: https://source.unsplash.com/collection/94734566/1920x1080
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## AI-Powered Log Analysis & Issue Resolution
  Automated monitoring and problem-solving system
drawings:
  persist: false
transition: slide-left
title: AI-Powered Log Analysis & Issue Resolution
---

# AI-Powered Log Analysis & Issue Resolution

An intelligent system for automated monitoring and problem-solving

<div class="authors">
  Martin Moreira de Jesus · Charley Geoffroy · Pierrot Sylvain · Thomas Mauran
</div>

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <button @click="$slidev.nav.openInEditor()" title="Open in Editor" class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon:edit />
  </button>
  <a href="https://github.com/slidevjs/slidev" target="_blank" alt="GitHub"
    title="View on GitHub" class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

---
layout: default
---

# System Overview

Our AI-powered system consists of several specialized services:

- 🤖 **Agent Service** - LangChain-powered AI for log analysis and issue resolution
- 💾 **Fluentd Service** - Aggregates logs from the cluster and forwards them to the NATS topic
- 🚪 **NATS Service** - NATS topic
- 🎙️ **TTS API** - Text-to-Speech for voice notifications
- 🎤 **STT API** - Speech-to-Text for operator responses

---
layout: default
---

# Event Flow Analysis

<div class="overflow-auto h-100">

```mermaid
sequenceDiagram
    participant K8s as Kubernetes
    participant Fluentd
    participant Agent as LangChain Agent
    participant ArgoCD
    participant TTS/STT
    participant Operator

    K8s->>Fluentd: Stream Events
    Fluentd->>Agent: Forward Events
    Agent->>Agent: Analyze & Detect
    alt Issue Found
        Agent->>ArgoCD: Request Changes
        ArgoCD->>K8s: Apply Fix
        alt Fix Failed
            Agent->>TTS/STT: Generate Alert
            TTS/STT->>Operator: Voice Notification
            Agent->>Agent: Wait for Response
            Operator->>TTS/STT: Voice Response
            TTS/STT->>Agent: Decode Response
            Agent->>ArgoCD: Request Manual Changes
            ArgoCD->>K8s: Apply Fix
        end
    end
```

</div>

---
layout: default
---

# Event Flow Architecture

<div class="overflow-auto">

```mermaid
graph TB
    subgraph K8s["K8s Cluster"]
        Pods[Pods] -->|Events| Fluentd[Fluentd]
    end

    subgraph Messaging["Event Processing"]
        Fluentd -->|Publish| NATS[NATS Topic]
        NATS -->|Subscribe| Agent[LangChain Agent]
    end

    subgraph Agent["LangChain Agent"]
        LLM[GPT-4 Mini] -->|Decision| Tools[Tool Selection]
        
        subgraph LangChainTools["Tools"]
            K8sVoice[K8sVoiceTool]
            TTS[TTSTool]
            STT[STTTool]
            Kubectl[KubectlCommand]
            Search[SearchRepoTool]
            Changes[RequestChangesTool]
        end
        
        Tools -->|Select| LangChainTools
        K8sVoice -->|Uses| TTS
        K8sVoice -->|Uses| STT
    end

    subgraph External["External"]
        TTSAPI[TTS API]
    end

    TTS -->|API| TTSAPI
    STT -->|API| TTSAPI

    subgraph Actions["Actions"]
        K8sVoice -->|check| Cluster[Check Cluster]
        K8sVoice -->|wait| Voice[Wait for Voice]
        Kubectl -->|exec| K8s[K8s API]
        Search -->|query| Repo[Repository]
        Changes -->|create| PR[Pull Request]
    end

    %% Styling
    classDef default fill:#2c3e50,stroke:#34495e,stroke-width:2px,color:#fff
    classDef agent fill:#2c3e50,stroke:#34495e,stroke-width:2px,color:#fff
    classDef llm fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    classDef k8sVoice fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff
    classDef kubectl fill:#27ae60,stroke:#219a52,stroke-width:2px,color:#fff
    classDef search fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:#fff
    classDef changes fill:#f1c40f,stroke:#f39c12,stroke-width:2px,color:#000
    classDef tts fill:#1abc9c,stroke:#16a085,stroke-width:2px,color:#fff
    classDef stt fill:#d35400,stroke:#a04000,stroke-width:2px,color:#fff
    classDef fluentd fill:#16a085,stroke:#138d75,stroke-width:2px,color:#fff
    classDef nats fill:#8e44ad,stroke:#7d3c98,stroke-width:2px,color:#fff
    classDef ttsApi fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff

    %% Apply styles
    class Agent agent
    class LLM llm
    class K8sVoice k8sVoice
    class Kubectl kubectl
    class Search search
    class Changes changes
    class TTS tts
    class STT stt
    class Fluentd fluentd
    class NATS nats
    class TTSAPI ttsApi
```

</div>

---
layout: default
---

# Input Layer Analysis

<div class="overflow-auto">

```mermaid
graph LR
    subgraph Input["Input Layer Details"]
        direction LR
        
        subgraph K8sEvents["Kubernetes Events"]
            PodEvents[Pod Events] -->|Status Changes| EventGen[Event Generator]
            ServiceEvents[Service Events] -->|Status Changes| EventGen
            NodeEvents[Node Events] -->|Status Changes| EventGen
        end

        subgraph FluentdConfig["Fluentd Configuration"]
            EventGen -->|Collect| Fluentd[Fluentd]
            Fluentd -->|Parse| Parser[Log Parser]
            Parser -->|Format| Structured[Structured Logs]
        end

        subgraph Output["Output Format"]
            Structured -->|Publish| NATS[NATS Topic]
            Structured -->|Store| Storage[Log Storage]
        end
    end

    %% Styling
    classDef default fill:#2c3e50,stroke:#34495e,stroke-width:2px,color:#fff
    classDef events fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    classDef config fill:#27ae60,stroke:#219a52,stroke-width:2px,color:#fff
    classDef output fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff

    %% Apply styles
    class PodEvents,ServiceEvents,NodeEvents,EventGen events
    class Fluentd,Parser,Structured config
    class NATS,Storage output
```

</div>

---
layout: default
---

# Processing Layer Analysis

<div class="overflow-auto">

```mermaid
graph LR
    subgraph Processing["Processing Layer Details"]
        direction LR
        
        subgraph NATSConfig["NATS Configuration"]
            Topic[kubernetes.events] -->|Subscribe| Agent[LangChain Agent]
            Topic -->|Backup| Backup[Event Backup]
        end

        subgraph AgentProcess["Agent Processing"]
            Agent -->|Analyze| Analysis[Log Analysis]
            Analysis -->|Context| LLM[GPT-4 Mini<br/>Decision Maker]
            
            subgraph Tools["Available Tools"]
                K8sVoice[K8sVoiceTool<br/>- Check cluster<br/>- Voice interaction]
                Kubectl[KubectlCommand<br/>- Run commands]
                Search[SearchRepoTool<br/>- Search repo]
                Changes[RequestChangesTool<br/>- Create PRs]
                TTS[TTSTool<br/>- Text to Speech]
                STT[STTTool<br/>- Speech to Text]
            end

            LLM -->|Select| Tools
            Tools -->|Results| LLM
        end

        subgraph Actions["Tool Actions"]
            K8sVoice -->|check| Cluster[Check Cluster]
            K8sVoice -->|wait| Voice[Wait for Voice]
            Kubectl -->|exec| K8s[K8s API]
            Search -->|query| Repo[Repository]
            Changes -->|create| PR[Pull Request]
        end
    end

    %% Styling
    classDef default fill:#2c3e50,stroke:#34495e,stroke-width:2px,color:#fff
    classDef nats fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff
    classDef process fill:#27ae60,stroke:#219a52,stroke-width:2px,color:#fff
    classDef llm fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff
    classDef tools fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:#fff
    classDef actions fill:#f1c40f,stroke:#f39c12,stroke-width:2px,color:#000

    %% Apply styles
    class Topic,Agent,Backup nats
    class Analysis process
    class LLM llm
    class K8sVoice,Kubectl,Search,Changes,TTS,STT tools
    class Cluster,Voice,K8s,Repo,PR actions
```

</div>

---
layout: default
---

# Agent Service (LangChain AI)

Core responsibilities:
- Log analysis and pattern recognition
- Issue detection and classification
- Automated fix attempts
- Verification of resolutions
- Natural language interaction

```python
# Key LangChain components:
- Log analysis chain
- Issue classification chain
- Fix generation chain
- Verification chain
- Voice interaction chain
```

---
layout: default
---


# Key Features

- 🤖 **AI-Powered Analysis**
  - LangChain for intelligent processing
  - Pattern recognition in logs
  - Automated issue detection

- 🎙️ **Voice Interface**
  - Natural language communication
  - Real-time operator interaction
  - Voice-based status updates

- 🔄 **Automated Resolution**
  - Self-healing capabilities
  - Verification of fixes
  - Fallback to human operators

---
layout: center
class: text-center
---

# Benefits

- 🚀 **Proactive Monitoring** - Early issue detection
- 🛠️ **Automated Resolution** - Self-healing system
- 🎯 **Human-AI Collaboration** - Natural interaction
- 📊 **Continuous Learning** - Pattern recognition
- ⚡ **Rapid Response** - Quick issue resolution
- 📈 **Scalable Architecture** - Microservices enable horizontal scaling

---
layout: default
---

# Challenges with LLM Integration

- ⏱️ **Performance Issues**
  - Slow response times
  - High latency in processing
  - Resource-intensive operations

- 🔄 **Inconsistent Behavior**
  - Non-deterministic outputs
  - Varying response quality
  - Different interpretations of same input

- 🎯 **Scoping Difficulties**
  - Hard to predict capabilities
  - Complex prompt engineering
  - Balancing flexibility vs. constraints

- 🛠️ **Development Challenges**
  - Difficult to debug
  - Hard to test thoroughly
  - Complex error handling

---
layout: center
class: text-center
---

# Live Demo

---
layout: default
---

# Conclusion

- 🎯 **Key Achievements**
  - Automated log analysis and issue detection
  - Voice-based human-AI interaction
  - GitOps-driven resolution workflow

- 🔮 **Future Directions**
  - Enhanced pattern recognition
  - Improved voice interaction
  - Extended automation capabilities

- 💡 **Key Takeaways**
  - AI can augment human operators
  - Voice interface enables natural interaction
  - Automated fixes reduce response time

---
layout: center
class: text-center
---

# Thank You!

Questions?

[Documentation](https://sli.dev) · [GitHub](https://github.com/slidevjs/slidev) 