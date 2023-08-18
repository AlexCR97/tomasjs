docker-compose --file ./integration-tests.compose.yml build --no-cache
docker-compose --file ./integration-tests.compose.yml up --detach --force-recreate
