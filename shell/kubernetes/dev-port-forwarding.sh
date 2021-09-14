# port-forward for localhost to access service in development
kubectl port-forward deployment/nest-backend 30080:3000 -n=$NAMESPACE