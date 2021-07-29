# Ocean Helm Chart

## Install
```
$ helm repo add nvidia https://nvidia.github.io/gpu-operator
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
$ helm repo update
$ helm dep update
$ helm install --wait ocean -n ocean .
```

## Add GPU Dashboard to Grafana
refer [DCGM Dashboard in Grafana](https://docs.nvidia.com/datacenter/cloud-native/kubernetes/dcgme2e.html#dcgm-dashboard-in-grafana)
