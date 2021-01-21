import { nodes } from './data/simple'

export default class Walker {
  private graph
  public actualNodeIndex: number
  public nextNodeIndex: number
  public path: number[] = []
  public speed: number
  public segmentProgression: number = 0
  public isMoving: boolean = false

  constructor (startNodeIndex: number, speed: number = 10) {
    this.speed = speed
    this.actualNodeIndex = startNodeIndex
    this.nextNodeIndex = this.actualNodeIndex
    this.graph = Object.assign({}, nodes.map(node => node.relations))
  }

  public goTo (nodeIndex: number) {
    let path = this.findShortestPath(this.nextNodeIndex, nodeIndex).path
    if (path[0] !== this.actualNodeIndex) path = [this.actualNodeIndex, ...path]
    this.path = path
    this.nextNodeIndex = this.path[1]
    this.isMoving = true
  }

  public step () {
    let changed = false
    const segmentDistance = this.graph[this.actualNodeIndex][this.nextNodeIndex] || 0
    if (segmentDistance === 0) return false
    this.segmentProgression += 1 / (segmentDistance / this.speed)
    while (this.segmentProgression > 1) {
      changed = true
      this.segmentProgression = this.segmentProgression - 1
      this.path.shift()
      this.actualNodeIndex = this.nextNodeIndex
      if (this.path[1]) this.nextNodeIndex = this.path[1]
      else {
        this.segmentProgression = 0
        this.isMoving = false
      }
    }
    return changed
  }

  private shortestDistanceNode (distances, visited) {
    // create a default value for shortest
    let shortest = null

    // for each node in the distances object
    for (const node in distances) {
      // if no node has been assigned to shortest yet
      // or if the current node's distance is smaller than the current shortest
      const currentIsShortest =
        shortest === null || distances[node] < distances[shortest]

      // and if the current node is in the unvisited set
      if (currentIsShortest && !visited.includes(node)) {
        // update shortest to be the current node
        shortest = node
      }
    }
    return shortest
  }

  private findShortestPath (startNode, endNode) {
    // track distances from the start node using a hash object
    let distances = {}
    distances[endNode] = 'Infinity'
    distances = Object.assign(distances, this.graph[startNode])// track paths using a hash object
    const parents = { endNode: null }
    for (const child in this.graph[startNode]) {
      parents[child] = startNode
    }

    // collect visited nodes
    const visited = []// find the nearest node
    let node = this.shortestDistanceNode(distances, visited)

    // for that node:
    while (node) {
    // find its distance from the start node & its child nodes
      const distance = distances[node]
      const children = this.graph[node]

      // for each of those child nodes:
      for (const child in children) {
        // make sure each child node is not the start node
        if (String(child) === String(startNode)) {
          continue
        } else {
          // save the distance from the start node to the child node
          const newdistance = distance + children[child]// if there's no recorded distance from the start node to the child node in the distances object
          // or if the recorded distance is shorter than the previously stored distance from the start node to the child node
          if (!distances[child] || distances[child] > newdistance) {
            // save the distance to the object
            distances[child] = newdistance
            // record the path
            parents[child] = node
          }
        }
      }
      // move the current node to the visited set
      visited.push(node)// move to the nearest neighbor node
      node = this.shortestDistanceNode(distances, visited)
    }

    // using the stored paths from start node to end node
    // record the shortest path
    const shortestPath = [endNode]
    let parent = parents[endNode]
    while (parent) {
      shortestPath.push(parent)
      parent = parents[parent]
    }
    shortestPath.reverse()

    // this is the shortest path
    const results = {
      distance: distances[endNode],
      path: shortestPath.map(p => Number(p))
    }
    // return the shortest path & the end node's distance from the start node
    return results
  }
}
