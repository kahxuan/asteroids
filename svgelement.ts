/** 
 * a little wrapper for creating SVG elements and getting/setting their attributes
 * and observing their events.
 * inspired by d3.js (http://d3js.org)
 */
class Elem {

    elem: Element;

    /**
    * @param svg is the parent SVG object that will host the new element
    * @param tag could be "rect", "line", "ellipse", etc.
    */
    constructor(svg: HTMLElement, tag: string, parent: Element = svg) {
        this.elem = document.createElementNS(svg.namespaceURI, tag);
        parent.appendChild(this.elem);
  }


    /**
    * all purpose attribute getter/setter
    * @param name attribute name
    * @param value value to assign to the attribute
    * @returns called with just the name of the attribute it returns the attribute's 
    * current value as a string, called with the name and a new value it sets the 
    * attribute and returns this object so subsequent calls can be chained
    */
    attr(name: string): string 
    attr(name: string, value: string | number): this
    attr(name: string, value?: string | number): this | string {
        if (typeof value === 'undefined') {
              return this.elem.getAttribute(name)!;
        }
        this.elem.setAttribute(name, value.toString());
        return this;
    }
    /**
    * @returns an Observable for the specified event on this element
    */
    observe<T extends Event>(event: string): Observable<T> {
        return Observable.fromEvent<T>(this.elem, event);
    }


    /**
    * Getter for value of a  given transformation
    * @param pos index of the transformation to be returned in the list of different 
    * transformations, a transformation can take up more than one position, e.g.
    * translate involve two numbers, so when this.attr("transform") == "translate(100 200)",
    * this.getTransform(1, "translate") returns 200
    * @param trans the name of the transformation which its value is to be returned
    * @returns 0 if there is no such transformation applied; otherwise, the value 
    * of the transformation
    */ 
    getTransfrom = (pos: number, trans: string): number => 
        !this.attr("transform") || !this.attr("transform").includes(trans)? 0: 
        parseFloat((<string[]><unknown>(this.attr('transform').match(/-?[0-9]+(\.[0-9]+)?/g)))[pos]);


    /**
    * Getter for value of translation applied in x direction, only use when the 
    * transformations are set using the setter provided, i.e. setTranslate(), setRotate()
    * @returns 0 if no translation is applied; otherwise; the value of the translation
    * in x direction
    */
    getTranslateX = (): number => this.getTransfrom(0, "translate")


    /**
    * Getter for value of translation applied in y direction, only use when the 
    * transformations are set using the setter provided, i.e. setTranslate(), setRotate()
    * @returns 0 if no translation is applied; otherwise; the value of the translation
    * in y direction
    */
    getTranslateY = (): number => this.getTransfrom(1, "translate")


    /**
    * Getter for value of rotation applied, only use when the 
    * transformations are set using the setter provided, i.e. setTranslate(), setRotate()
    * @returns 0 if no rotation is applied; otherwise; the value of the translation
    * in y direction
    */
    getRotate = (): number => this.getTransfrom(2, "rotate");


    /**
    * Setter for translation
    * @param x value of translation to be set to in x direction
    * @param y value of translation to be set to in y direction
    * @returns this SVG element
    */
    setTranslate = (x: number, y: number): this => 
        this.attr("transform", `translate(${x} ${y}) rotate(${this.getRotate()})`);


    /**
    * Move the SVG element forward, which is, translate it in y direction while 
    * taking the degree of rotation applied into account, ensure proper wrapping
    * around the edge of the given canvas where the map in it is a torus topology.
    * The proper wrapping only applies when the origin of translation of the SVG 
    * element is at the middle of the canvas 
    * @param dist distance to move the element forward
    * @param canvas an object containing the width and height of the canvas that
    * bounds the SVG element
    * @returns this SVG element
    */
    move = (dist: number, canvas: {width: number, height: number}): this => {
        const offsetX = Math.round(dist * Math.cos((this.getRotate() + 90) * Math.PI / 180));
        const offsetY =  Math.round(dist * Math.sin((this.getRotate() + 90) * Math.PI / 180));

        return (offsetX < 0 && this.getTranslateX() < - canvas.width / 2) ?
            this.setTranslate(this.getTranslateX() + canvas.width + 10, this.getTranslateY()) :

        (offsetX > 0 && this.getTranslateX() > canvas.width / 2) ?
            this.setTranslate(this.getTranslateX() - canvas.width - 10, this.getTranslateY()) :

        (offsetY < 0 && this.getTranslateY() < - canvas.height / 2) ?
            this.setTranslate(this.getTranslateX(), this.getTranslateY() + canvas.width + 10) :

        (offsetY > 0 && this.getTranslateY() > canvas.height / 2) ?
            this.setTranslate(this.getTranslateX(), this.getTranslateY() - canvas.width - 10) : 

            this.setTranslate(this.getTranslateX() + offsetX, this.getTranslateY() + offsetY);
    }


    /**
    * Setter for rotation
    * @param deg value of rotation to be set to
    * @returns this SVG element
    */
    setRotate = (deg: number): this => 
        this.attr("transform", `translate(${this.getTranslateX()} ${this.getTranslateY()}) rotate(${deg})`);


    /**
    * Rotate the SVG element by certain degree
    * @param offset degree of rotation to be added to the current rotation value
    * @returns this SVG element
    */
    rotate = (offset: number): this => 
        this.setRotate(this.getRotate() + offset);


    /**
    * Remove the SVG element that has the shape of polygon from the screen by 
    * hiding it
    * @returns this SVG element
    */
    removePoly = (): this => this.attr("points", "0,0");


    /**
    * Determine if the SVG element that has the shape of polygon is being hidden 
    * @returns true if the SVG element is being hidden from screen; false otherwise.
    */
    isRemovedPoly = (): boolean => this.attr("points") == "0,0";


    /**
    * Set the points of the SVG element that has the shape of polygon
    * @returns this SVG element
    */
    setPointsPoly = (...points: number[][]): this => {
        points.forEach((point) => point.join(","));
        return this.attr("points", points.join(" "))
    }


    /**
    * Set the width and height of the SVG element that has the shape of rectangle
    * to be the same as the given canvas to act as a frame to overlay the canvas
    * @param canvas an object containing the width and height of the canvas to be
    * overlaid
    * @returns this SVG element
    */
    showFrame = (canvas: {width: number, height: number}): this => 
        this.attr("width", canvas.width).attr("height", canvas.height);


    /**
    * Set the height of the SVG element that has the shape of rectangle to 0 to
    * stop it from overlaying the canvas
    * @returns this SVG element
    */
    hideFrame = (): this => this.attr("height", "0");

}