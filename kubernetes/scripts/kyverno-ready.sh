#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Global variables to check if Kyverno is ready
CHECK_TYPE="Ready"
CHECK_MESSAGE="Ready"
CHECK_REASON="Succeeded"
CHECK_STATUS="True"

# Get all cluster policies
clusterpolicies=$(kubectl get clusterpolicies -o json -n kyverno | jq '.items')

# Check that status.conditions[*].type == Ready
for row in $(echo "${clusterpolicies}" | jq -r '.[] | @base64'); do

    _jq() {
     echo ${row} | base64 --decode | jq -r ${1}
    }

    name=$(_jq '.metadata.name')
    message=$(_jq '.status.conditions[0].message')
    reason=$(_jq '.status.conditions[0].reason')
    status=$(_jq '.status.conditions[0].status')
    type=$(_jq '.status.conditions[0].type')

    if [ "$type" != "$CHECK_TYPE" ] || [ "$message" != "$CHECK_MESSAGE" ] || [ "$reason" != "$CHECK_REASON" ] || [ "$status" != "$CHECK_STATUS" ]; then
        echo -e "${RED}----------- ClusterPolicy $name is not ready -----------${NC}"
        echo -e "${YELLOW}Expected values:${NC}"
        echo -e "Message:${GREEN}$CHECK_MESSAGE${NC}"
        echo -e "Reason:${GREEN}$CHECK_REASON${NC}"
        echo -e "Status:${GREEN}$CHECK_STATUS${NC}"
        echo -e "Type:${GREEN}$CHECK_TYPE${NC}"

        echo -e "${YELLOW}---------------------------------${NC}"
        echo -e "${RED}Actual values:${NC}"
        echo -e "Message:${RED}$message${NC}"
        echo -e "Reason:${RED}$reason${NC}"
        echo -e "Status:${RED}$status${NC}"
        echo -e "Type:${RED}$type${NC}"
        echo -e "${YELLOW}---------------------------------${NC}"
        exit 1
    fi
done

echo -e "${GREEN}All ClusterPolicies are ready.${NC}"