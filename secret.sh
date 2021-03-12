#!/bin/bash

kubectl create secret generic ocean-secret \
--from-literal=MONGOURI=mongodb://<USER>:<PASSWORD>@<MONGO_IP>:<MONGO_PORT> \
--from-literal=SECRET=<SECRET_KEY> \
--from-literal=KUBE_API_URL=<KUBERNETES_API_URL> \
--from-literal=KUBE_TOKEN=<KUBERNETES_CLUSTER_ADMIN_SERVICEACCOUNT_TOKEN> \
--from-file=ca.crt \
-n ocean

