import CanvasForceWorkerMessage from "../util/forceworkermessage";
importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-dispatch.v1.min.js");
importScripts("https://d3js.org/d3-quadtree.v1.min.js");
importScripts("https://d3js.org/d3-timer.v1.min.js");
importScripts("https://d3js.org/d3-force.v1.min.js");

self.onmessage = function(e: MessageEvent) {
    
    if(e.data) {
        const data = e.data;
        
        if(data.nodes) {
            worker.setNodes(data.nodes);
        }
        if(data.links) {
            worker.setLinks(data.links);
        }
        if(data.nodeDrag) {
            worker.setNodeForce(data.nodeDrag.index, data.nodeDrag.fx, data.nodeDrag.fy);
        }
        if(data.alphaTarget) {
            worker.setAlphaTarget(data.alphaTarget);
        }
        if(data.force) {
            worker.setForce(data.force.name, data.force.fct);
        }
        if(data.restart) {
            worker.restart();
        }
    }
};

class SvgToCanvasForceWorker {
    
    private simulation;
    private nodes;
    private links;
    private sentInitial = false;
    
    constructor() {
        const d3 = (self as any)['d3'];
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(960 / 2, 600 / 2));
        
        this.simulation.on('tick', () => {
            //console.log('tick', arguments);
            const data = {type: "tick", nodes: this.nodes};
            if(!this.sentInitial && this.links) {
                this.sentInitial = true;
                data['links'] = this.links;
                console.log('sending links', this.links);
            }
            postMessage(data);
        })
    }

    setNodeForce(index, fx, fy) {
        this.nodes[index].fx = fx;
        this.nodes[index].fy = fy;
    }
    
    setNodes(nodes) {
        this.nodes = nodes;
        this.simulation.nodes(this.nodes);
    }
    
    setLinks(links) {
        this.links = links;
        this.simulation.force("link").links(this.links);
    }

    setForce(name, fct) {
        console.log(name, fct);
    }

    setAlphaTarget(alpha: number) {
        this.simulation.alphaTarget(alpha);
    }

    restart() {
        this.simulation.restart();
    }
}

let worker = new SvgToCanvasForceWorker();