IMAGE_NAME="cypress_tests_image"
CONTAINER_NAME="cypress_tests_container"

# if --local flag IS passed
if [ "$1" == "--local" ]; then

  echo "running cypress tests locally..."

  # if image has not already been built
  if [ "$(docker images -q $IMAGE_NAME 2>/dev/null)" == "" ]; then
    echo "$IMAGE_NAME not found, building..."
    # build the dockerfile
    docker build \
      --tag $IMAGE_NAME \
      ./e2e

  fi

  # if container has not already been built
  if [ "$(docker ps -aq -f name=$CONTAINER_NAME 2>/dev/null)" == "" ]; then

    echo "$CONTAINER_NAME not found, creating..."
    # check if container is already running
    docker run \
      -it \
      --name $CONTAINER_NAME \
      -v ./e2e/cypress:/tests/cypress \
      --env-file e2e/.env \
      $IMAGE_NAME

    echo "$CONTAINER_NAME started"

  # if container has already been built
  else

    echo "$CONTAINER_NAME found..."

    # check if container is running
    if [ "$(docker ps -aq -f status=running -f name=$CONTAINER_NAME 2>/dev/null)" == "" ]; then
      # if running, start it
      echo "$CONTAINER_NAME container not running, starting..."
      docker container start $CONTAINER_NAME >/dev/null
      echo "$CONTAINER_NAME started"
    fi
    # now attach to the container
    echo "$CONTAINER_NAME container running,reattaching..."
    docker attach $CONTAINER_NAME
  fi

# if --local flag IS NOT passed
else
  # run build, run then remove image
  echo "running cypress tests in docker then removing image..."

  docker run \
    --rm \
    -it \
    --env-file e2e/.env \
    $(docker build -q ./e2e)
fi
