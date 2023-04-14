docker-compose --file ./compose-rabbitmq.yml build --no-cache
docker-compose --file ./compose-rabbitmq.yml up --detach --force-recreate
