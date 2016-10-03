var Intersect = function(intersections) {
    this.intersections = intersections || [];
}

Intersect.prototype.add = function(intersection) {
    this.intersections.push(intersection);
}

Intersect.prototype.lookFor = function(lookFor) {

    var searchResult = false;
    var self = this;
    if (typeof lookFor === 'object') {
        lookFor.forEach(function(value) {
            if (self.intersections.indexOf(value) != -1) searchResult = true;
        });
    } else {
        if (this.intersections.indexOf(lookFor) != -1) searchResult = true;
    }

    return searchResult;
}
