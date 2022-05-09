.PHONY: forward-ports
forward-ports:
	ssh ubuntu@54.195.190.38 -L 8000:localhost:8000 -L 8020:localhost:8020 -L 5001:localhost:5001 -L 5601:localhost:5601

.PHONY: forward-ports-pprod
forward-ports-pprod:
	ssh ubuntu@graph.phf.pragma-dev.space -L 8000:localhost:8000 -L 8020:localhost:8020 -L 5001:localhost:5001 -L 5601:localhost:5601

.PHONY: create
create:
	graph create -g http://localhost:8020 phuture/mvp

.PHONY: deploy
deploy:
	graph deploy -g http://localhost:8020 -i http://localhost:5001 phuture/mvp

.PHONY: cdcreate
cdcreate:
	./graph create -g http://localhost:8020 phuture/mvp

.PHONY: cddeploy
cddeploy:
	./graph deploy -g http://localhost:8020 -i http://localhost:5001 phuture/mvp -l v0.0.1
