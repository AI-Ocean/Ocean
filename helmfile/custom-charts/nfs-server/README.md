# nfs-server

## 주의점

rancher를 통해 설치할 경우, local-storage PV를 위해 고려해야할 점은 아래와 같습니다.
1. rancher RKE의 경우, docker 위에 클러스터가 설치됩니다.
2. docker 기반이므로, PV가 사용할 로컬 디렉토리(hostpath)는 먼저 kubelet에 마운트되어 있어야 합니다. ([ref](https://rancher.com/docs/rke/latest/en/config-options/services/services-extras/#extra-binds))
