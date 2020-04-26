"use strict";
class Elem {
    constructor(svg, tag, parent = svg) {
        this.getTransfrom = (pos, trans) => !this.attr("transform") || !this.attr("transform").includes(trans) ? 0 :
            parseFloat((this.attr('transform').match(/-?[0-9]+(\.[0-9]+)?/g))[pos]);
        this.getTranslateX = () => this.getTransfrom(0, "translate");
        this.getTranslateY = () => this.getTransfrom(1, "translate");
        this.getRotate = () => this.getTransfrom(2, "rotate");
        this.setTranslate = (x, y) => this.attr("transform", `translate(${x} ${y}) rotate(${this.getRotate()})`);
        this.move = (dist, canvas) => {
            const offsetX = Math.round(dist * Math.cos((this.getRotate() + 90) * Math.PI / 180));
            const offsetY = Math.round(dist * Math.sin((this.getRotate() + 90) * Math.PI / 180));
            return (offsetX < 0 && this.getTranslateX() < -canvas.width / 2) ?
                this.setTranslate(this.getTranslateX() + canvas.width + 10, this.getTranslateY()) :
                (offsetX > 0 && this.getTranslateX() > canvas.width / 2) ?
                    this.setTranslate(this.getTranslateX() - canvas.width - 10, this.getTranslateY()) :
                    (offsetY < 0 && this.getTranslateY() < -canvas.height / 2) ?
                        this.setTranslate(this.getTranslateX(), this.getTranslateY() + canvas.width + 10) :
                        (offsetY > 0 && this.getTranslateY() > canvas.height / 2) ?
                            this.setTranslate(this.getTranslateX(), this.getTranslateY() - canvas.width - 10) :
                            this.setTranslate(this.getTranslateX() + offsetX, this.getTranslateY() + offsetY);
        };
        this.setRotate = (deg) => this.attr("transform", `translate(${this.getTranslateX()} ${this.getTranslateY()}) rotate(${deg})`);
        this.rotate = (offset) => this.setRotate(this.getRotate() + offset);
        this.removePoly = () => this.attr("points", "0,0");
        this.isRemovedPoly = () => this.attr("points") == "0,0";
        this.setPointsPoly = (...points) => {
            points.forEach((point) => point.join(","));
            return this.attr("points", points.join(" "));
        };
        this.showFrame = (canvas) => this.attr("width", canvas.width).attr("height", canvas.height);
        this.hideFrame = () => this.attr("height", "0");
        this.elem = document.createElementNS(svg.namespaceURI, tag);
        parent.appendChild(this.elem);
    }
    attr(name, value) {
        if (typeof value === 'undefined') {
            return this.elem.getAttribute(name);
        }
        this.elem.setAttribute(name, value.toString());
        return this;
    }
    observe(event) {
        return Observable.fromEvent(this.elem, event);
    }
}
//# sourceMappingURL=svgelement.js.map