# nfs-server

## 주의점

1. Host에 nfs-common 라이브러리가 반드시 설치되어 있어야 합니다. nfs-common 라이브러리가 존재하지 않을 경우, mount되지 않습니다.

2. rancher를 통해 설치할 경우, local-storage PV를 위해 고려해야할 점은 아래와 같습니다.
    - rancher RKE의 경우, docker 위에 클러스터가 설치됩니다.
    - docker 기반이므로, PV가 사용할 로컬 디렉토리(hostpath)는 먼저 kubelet에 마운트되어 있어야 합니다. ([ref](https://rancher.com/docs/rke/latest/en/config-options/services/services-extras/#extra-binds))

