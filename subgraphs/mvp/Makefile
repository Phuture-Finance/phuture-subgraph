
.PHONY: forward-ports
forward-ports:
	ssh ubuntu@54.195.190.38 -L 8000:localhost:8000 -L 8020:localhost:8020 -L 5001:localhost:5001 -L 5601:localhost:5601

.PHONY: create-graph
create-graph:
	graph create -g http://localhost:8020 phuture/mvp

.PHONY: deploy-graph
deploy-graph:
	graph deploy -g http://localhost:8020 -i http://localhost:5001 phuture/mvp

