# Prerequisite

## 1. NFS

모든 노드에 해당 패키지가 설치되어 있어야 한다. 설치되어 있지 않을 경우 "you might need a /sbin/mount.<type> helper program." 에러가 뜨며 mount가 안됨.
```bash
apt-get install nfs-common
```

## 2. helm plugin diff 설치

helmfile apply를 수행하기 위헤서 helm에 plugin을 추가하여야 한다.
```bash
helm plugin install https://github.com/databus23/helm-diff
```