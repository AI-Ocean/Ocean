# Ocean
GPU management System on Kubernetes For AI, Deep-Learning, Machine-Learning Researcher.

## Install with Helm
```
$ helm dep update
$ helm install ocean -n ocean ./helm
```

## Install with basic scripts
### Prerequest
0. setup mongodb.
1. get admin token of your kubernetes cluster.
2. copy certification of your kubernetes cluster to here `./ca.crt`.
3. edit `secret.sh` file.

### Install
1. apply initial-config.yml
```shell
# kubectl apply -f initial-config
```

2. apply backend
```shell
# kubectl apply -f ocean-backend.yml
```

3. apply frontend
```shell
# kubectl apply -f ocean-frontend.yml
```

## access
enter with `http://<kube-api-server>:30088`.

> initial admin id: `admin@admin.com`, password: `admin!@`
