if [[ "$#" -ne 1 ]]
then
	echo "Incorrect number of arguments!"
	exit 130
else
	docker stop $1
	docker rmi -f atlas-local-db
	docker system prune

	rm -rf shipping_backend/migrations/00*.py
fi
