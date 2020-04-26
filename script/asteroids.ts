function asteroids() {

    /**
    * Svg element that represents canvas
    */
    const svg: HTMLElement = document.getElementById("canvas")!;


    /**
    * Object containing the width and height of the canvas for easy access of the 
    * attributes
    */
    const canvas: {width: number, height: number} = 
        {width: parseInt(svg.getAttribute("width")!),
         height: parseInt(svg.getAttribute("height")!)};


    /**
    * A curried function that adds noise to a number, first take in the range
    * of noise, then take in the number to be added with noise
    * @param range range of value that can be returned after adding noise to it
    * @returns a function that has a parameter (number to be added noise) and
    * returns the number after noise is being added
    */
    const randomize = (range: number): ((arg0:number) => number) => 
        (x: number): number => x + Math.random() * range - range / 2;
    // it is a curried so that the range of the noise added do not have to be 
    // repeatedly passed in as randomize function of some certain range is called 
    // for multiple times.


    /**
    * Getter for innerHTML of HTML element of numerical type
    * @param id ID of HTML element
    * @returns the number contained in the innerHTML of the HTML element
    */
    const getValById = (id: string): number => 
        parseInt(document.getElementById(id)!.innerHTML);


    /**
    * Set the innerHTML of a HTML element to a given numerical value
    * @param id ID of HTML element
    * @param x value to set innerHTML to
    * @returns x in string
    */
    const setIdVal = (id: string, x: number): String => 
        document.getElementById(id)!.innerHTML = String(x);


    /**
    * Increment the innerHTML of a HTML element of numerical type by a given value
    * @param id ID of HTML element
    * @param x value to increment HTML element by 
    * @returns x in string
    */
    const incrementID = (id: string, x: number): String => 
        setIdVal(id, getValById(id) + x);


    /**
    * Set the height of the SVG element that has the shape of rectangle to 0 to
    * stop it from overlaying the canvas
    * @returns distance between the two given SVG elements
    */
    const distance = (e1: Elem, e2: Elem): number =>
        Math.pow(e1.getTranslateX() - e2.getTranslateX(), 2) + 
        Math.pow(e1.getTranslateY() - e2.getTranslateY(), 2);


    /**
    * Create a list of hearts where each of them is a SVG element, the hearts
    * will be arranged from left to right and the leftmost heart should be
    * used first.
    * @param n number of hearts to be created
    * @param container a list to contains the hearts, should be an empty list
    * @returns a list containing the hearts created 
    */
    const createHearts = (n: number, container: Elem[] = []) : Elem[] =>
        n? createHearts(n - 1, container.concat(new Elem(svg, 'polygon', heart.elem)
            .setPointsPoly([-12, 0], [-9, -6], [-6, -6], [0, 0], [6, -6], [9, -6], [12, 0], [0, 13])
            .setTranslate((- n + 1) * 40, 0))) : container;
        // this function is written in a declarative style by using recursion


    /**
    * Reset the hearts, by rearranging the hearts into their correct position 
    * @param n number of hearts to be created
    * @param container a list to contains the hearts, should be an empty list
    */
    const restartHeart = (container: Elem[]): void => {
        const arrangeHearts = () => {
            if (container[container.length - 1].getTranslateX() < container[0].getTranslateX()) {
                useContainedElem(container);
                arrangeHearts();
            }
        }
        arrangeHearts(); 
        // to ensure that the first unused heart is positioned on the left so that 
        // the leftmost heart disappears when hitpoints are deducted
        refillHearts(heartContainer, heartContainer.length)
    }


    /**
    * Create a list of deactivated bullets where each of them is a SVG element,
    * deactivated bullets are hidden
    * @param n number of bullets to be created
    * @param container a list to contains the bullets, should be an empty list
    * @returns a list containing the deactivated bullets created 
    */
    const createBullets = (n: number, container: Elem[] = []): Elem[] => 
        n? createBullets(n - 1, container.concat(new Elem(svg, "circle", bullets.elem)
            .attr("r", "0"))) : container;


    /**
    * Create a list of empty energy bars where each of them is a SVG element, empty 
    * energy bars are hidden
    * @param n number of energy bars to be created
    * @param container a list to contains the energy bars, should be an empty list
    * @returns a list containing the empty energy bars created 
    */
    const createEnergyBars = (n: number, container: Elem[] = []): Elem[] => 
        n? createEnergyBars(n - 1, container.concat(new Elem(svg, "rect", energyBars.elem)
            .attr("style", `fill:rgb(${80 + n * 50},${255 - n * 17},100);stroke-width:0`)
            // colour of bars go from red to green
            .attr("fill-opacity", "0.1")
            .setTranslate(container.length * 25, 0)
            .attr("height", "7")
            .attr("width", "23"))) : container


    /**
    * Get the number of non-empty energy bars in the given energy container
    * @param container a list containing energy bars
    * @returns number of non-empty energy bars in the given energy container
    */
    const getEnergyCount = (container: Elem[]) : number =>
        container
            .map((e :Elem) => parseFloat(e.attr("fill-opacity")))
            .reduce((total, cur) => total + (cur > 0.7 - 1e-10? 1: 0), 0)
            // non-empty energy bar has opacity of 0.7


    /**
    * Move the first element in the container to the last and return it (unused
    * element comes before used element in such container)
    * @param container a list containing elements
    * @return the first unused element in the given container
    */
    const useContainedElem = (container: Elem[]): Elem => 
        container[container.push(<Elem>container.shift()) - 1]


    /**
    * Empty a number of energy bars in a given container
    * @param container a list containing energy bars to be emptied
    * @param n number of energy bars to be emptied
    */
    const clearEnergy = (container: Elem[], n: number): void => {
        if (n && getEnergyCount(container) > 0) {
            container.unshift(<Elem>container.pop());
            container[0].attr("fill-opacity", "0.1");
            return clearEnergy(container, n - 1);
        } 
    } 


    /**
    * Refill a number of hearts in the given container, each filled heart is moved
    * to the start of the list
    * @param container a list containing hearts to be refilled
    * @param n number of hearts to be refilled
    */
    const refillHearts = (container: Elem[], n: number) : void => {
        if (n && container[container.length - 1].isRemovedPoly()) {
            container.unshift(<Elem>container.pop());
            container[0].setPointsPoly([-12, 0], [-9, -6], [-6, -6], [0, 0], [6, -6], [9, -6], [12, 0], [0, 13]);
            return refillHearts(container, n - 1);
        }
    }


    /**
    * Move a bullet in a constant speed and direction at 15ms interval, the bullet 
    * stop moving and is hidden after 700ms
    * @param bullet a Elem representing a bullet to be moved
    * @returns unsubscribe function, which hides the bullet
    */
    const moveBullet = (bullet: Elem): (() => void) => 
        Observable.interval(15)
            .takeUntil(Observable.interval(700))
            .subscribe(()=> {
                bullet.move(-5, canvas);
            }, () => bullet.attr("r", 0));
    

    /**
    * Emit a bullet from the given SVG element
    * @param elem a SVG element that initiates the attack
    * @returns unsubscribe function, which hides the bullet
    */
    const attack = (elem: Elem): () => void => 
        moveBullet(useContainedElem(bulletContainer)
            .attr("r", "3")
            .setTranslate(elem.getTranslateX(), elem.getTranslateY())
            .setRotate(elem.getRotate())
            .move(-17, canvas)) // bullet fires from the head of ship
  

    /**
    * Emit bullets from the given SVG element in all directions
    * @param elem a SVG element that initiates the special attack
    */
    const skilledAttack = (elem: Elem): void => {

        //move a bullet in a constant speed, the direction depends on param deg
        const rotateAndAttack = (deg: number) =>
            moveBullet(useContainedElem(bulletContainer)
                .setTranslate(elem.getTranslateX(), elem.getTranslateY())
                .attr("r", "3")
                .rotate(deg))

        Observable.interval(10) // shoots multiple bullets
            .takeUntil(Observable.interval(1000))
            .subscribe(n => rotateAndAttack(n * 5), // in multiple direction
                () => clearEnergy(energyContainer, 5))
    }


    /**
    * Creates an observable that notifies when the given rock has been destroyed
    * @param rock a SVG element to be checked on
    * @returns an observable that notifies when the given rock has been destroyed
    */
    const destroyedO = (rock: Elem): Observable<number> => 
        Observable.interval(1)
            .filter(() => !enemy.elem.contains(rock.elem) || 
                rock.attr("points") == "0,0 2,0 2,2 0,2"); // rock in debris form


    /**
    * Move a rock element at 50ms interval at random speed and random direction
    * until the rock has been destroyed, the movement will be interupped when the 
    * game is paused. The higher the level of the game, the faster the rock moves
    * @param rock a SVG element to be given movement
    * @returns unsubcribe function, which is a void function
    */
    const moveAsteroid = (rock: Elem): () => void => 
        Observable.interval(50)
            .takeUntil(destroyedO(rock))
            .filter(() => !pause())
            .subscribe(() => rock
                .move(- 3.5 - getValById("level") / 2, canvas) 
                // move faster when level is higher
                .rotate((Math.random() > 0.8? Math.random() * 30 - 15 : 0)))
                // change direction of movement randomly at 20% chance


    /**
    * A curried function that makes a rock element damageable, i.e., the target
    * element's life will be deducted when they collide. This function first take 
    * in the radius of the rock, then the rock and target elements
    * @param r approximate radius of rock element, i.e., rock is considered to be
    * collided with target when their distance is less than r
    * @returns a function that has two parameters (a rock element and the target 
    * element) and returns the unsubcribe function, which is a void function
    */
    const makeDamageable = (r: number) => (rock: Elem, target: Elem): () => void =>
        Observable.interval(1)
            .takeUntil(destroyedO(rock))
            .takeUntil(restartO)
            .filter(() => !gameOver() && !pause())
            .filter(() => distance(rock, target) < r)
            .subscribe(() => {
                enemy.elem.removeChild(rock.elem);
                useContainedElem(heartContainer).removePoly();
                resumeFrame.attr("style", "fill:red;fill-opacity:0.3");
                Observable.interval(120)
                    .takeUntil(Observable.interval(120))
                    .subscribe(e => undefined, () => resumeFrame.attr("style", "fill:red;fill-opacity:0"))
                // to create red screen flash when ship is hit
            })      


    /**
    * A curried function that makes a rock element mortal, i.e., the rock will
    * be destroyed when it is hit by any bullet in bulletContainer. This function 
    * first take in the radius of the rock, then the rock and a unsubscribe function 
    * that will be called when the rock is hit by a bullet
    * @param r approximate radius of rock element, i.e., rock is considered to be
    * hit by a bullet when their distance is less than r
    * @returns a function that has two parameters (a rock element and the function 
    * that should be called when rock is destroyed) and returns the clean up function
    */
    const mortalise = (r: number) => (rock: Elem, cleanUp: (() => void)) =>
        Observable.interval(1)
            .takeUntil(destroyedO(rock))
            .takeUntil(restartO)
            .filter(() => bulletContainer
                .filter(b => parseInt(b.attr("r")) > 0)
                .some(b => distance(rock, b) < r))
            .subscribe(cleanUp)         


    /**
    * Creates an small asteroid that moves randomly, is able to destroyed the target
    * and itself by collision and will be destroyed when hit by a bullet. When it 
    * is destroyed, it remains as a debris that can be collected by the target to 
    * gain energy
    * @param target ship element that can destroy and be destroyed by the asteroid
    * created
    * @param initial optional, position of asteroid created
    */
    const createSmallAsteroid = (target: Elem, init?: {x: number, y: number}): void => {

        const r = randomize(10);

        const rock = new Elem(svg, "polygon", enemy.elem)
            .setPointsPoly([r(15.5), r(9)], [r(0), r(18)], [r(-15.5), r(9)], 
                           [r(-15.5), r(-9)], [r(0), r(-18)], [r(15.5), r(-9)])
            // irregular shape

        init? rock.setTranslate(init.x + Math.random() * 10, init.y + Math.random() * 10):
        Math.random() < 0.5? 
        rock.setTranslate(canvas.width / 2, Math.random() * canvas.height - canvas.height / 2):
        rock.setTranslate(Math.random() * canvas.width  - canvas.width/ 2, canvas.height / 2)
        // generate rock at random position at the boarder if position not given
        rock.setRotate(Math.random() * 360)
        // set rock initial direction randomly

        const cleanUp = () => {
            incrementID("score", 2);
            rock.setPointsPoly([0, 0], [2, 0], [2, 2], [0, 2]); 
            // turn rock into debris
            Observable.interval(1)
                .takeUntil(Observable.interval(1).filter(() => !enemy.elem.contains(rock.elem)))
                .filter(() => 
                    distance(rock, target) < 300)
                .subscribe(() => {
                    enemy.elem.removeChild(rock.elem);
                    incrementID("score", 1);
                    getEnergyCount(energyContainer) < energyContainer.length ? 
                    useContainedElem(energyContainer).attr("fill-opacity", "0.7"):
                    undefined;
                });
            // enable debris to be collected by ship to increment score and energy

            if (Math.random() > 0.9) { 
                const heart = new Elem(svg, 'polygon', inventoryHeart.elem)
                    .setPointsPoly([-12, 0], [-9, -6], [-6, -6], [0, 0], [6, -6], [9, -6], [12, 0], [0, 13])
                    .setTranslate(randomize(20)(rock.getTranslateX()), randomize(20)(rock.getTranslateY()))
                    Observable.interval(1)
                        .takeUntil(restartO)
                        .takeUntil(Observable.interval(1).filter(() => !inventoryHeart.elem.contains(heart.elem)))
                        .filter(() => distance(heart, target) < 300)
                        .subscribe(() => {
                            inventoryHeart.elem.removeChild(heart.elem)
                            refillHearts(heartContainer, 1);
                        })
            }
            // rock has 10% chance of dropping heart that can restore hitpoints
            // when destroyed
        }

        moveAsteroid(rock);
        makeDamageable(1200)(rock, target);
        mortalise(800)(rock, cleanUp);
    }


    /**
    * Creates an big asteroid that moves randomly, is able to destroyed the target
    * and itself by collision and will be destroyed when hit by a bullet. When it 
    * is destroyed, it is removed and three small asteroids are created at the same 
    * position
    * @param target ship element that can destroy and be destroyed by the asteroid
    * created
    */
    const createBigAsteroid = (target: Elem): void => {

        const r = randomize(20);

        const bigRock = new Elem(svg, "polygon", enemy.elem)
            .attr("style", "fill:#6b6b47;stroke:#f7f7f0;stroke-width:3")
            .setPointsPoly([r(35.5), r(20.5)], [r(0), r(41)], [r(-35.5), r(20.5)], 
                           [r(-35.5), r(-20.5)], [r(0), r(-41)], [r(35.5), r(-20.5)])

        Math.random() < 0.5? 
        bigRock.setTranslate(canvas.width / 2, Math.random() * canvas.height - canvas.height / 2):
        bigRock.setTranslate(Math.random() * canvas.width  - canvas.width/ 2, canvas.height / 2)
        // generate rock at random position at the boarder

        const cleanUp = () => {
            enemy.elem.removeChild(bigRock.elem);
            const coord = {x: bigRock.getTranslateX(),
                           y: bigRock.getTranslateY()}
            Observable.interval(200)
                .takeUntil(Observable.interval(250))
                .subscribe((e) => e, () => {
                    createSmallAsteroid(target, coord);
                    createSmallAsteroid(target, coord);
                    createSmallAsteroid(target, coord); 
                    // broken down into three small rocks
                })
        }

        moveAsteroid(bigRock);
        makeDamageable(2500)(bigRock, target);
        mortalise(2100)(bigRock, cleanUp);
    }


    /**
    * Creates a enemy ship is able to destroyed the target and itself by collision,
    * follow and aim the target. Its ability to aim at the target depends on level
    * of the game
    * @param target ship element that is aimed by the enemy ship
    */
    const createEnemyShip = (target: Elem): void => {

        const enemyShip = new Elem(svg, 'polygon', enemy.elem)
            .attr("style", "fill:#ff8573;stroke:white;stroke-width:0") 
            .setPointsPoly([-13, 20], [13, 20], [0, -20])

        Math.random() < 0.5? 
        enemyShip.setTranslate(canvas.width / 2, Math.random() * canvas.height - canvas.height / 2):
        enemyShip.setTranslate(Math.random() * canvas.width  - canvas.width/ 2, canvas.height / 2)
        // generate enemy ship at random position at the boarder
        enemyShip.setRotate(Math.random() * 360)
        // set rock initial direction randomly

        // move the enemy ship
        Observable.interval(50)
            .takeUntil(destroyedO(enemyShip))
            .filter(() => !pause())
            .subscribe(() => {
                const toTurn = Math.atan2(-target.getTranslateY() + enemyShip.getTranslateY(), 
                    - target.getTranslateX() + enemyShip.getTranslateX()) * 180 / Math.PI - 90 - enemyShip.getRotate();
                // angle to rotate to aim at ship
                enemyShip.move(- 3.5 - getValById("level") / 2, canvas);
                // move faster when game is in higher level
                enemyShip.rotate(Math.random() > (0.7 - getValById("level") / 20)? 
                    (toTurn >= 0? Math.min(5, toTurn): Math.max(-5, toTurn)): 0);
                // higher level gives enemy ship higher chance to rotate so it aims
                // at player ship more easily
                // it can rotate at most by 5 degree at a time
            })

        makeDamageable(1000)(enemyShip, target);
        mortalise(600)(enemyShip, () => enemy.elem.removeChild(enemyShip.elem))

        // enable shooting, higher level enemy ship shoots faster
        Observable.interval(500 - getValById("level") * 10)
            .takeUntil(Observable.interval(1).filter(() => !enemy.elem.contains(enemyShip.elem)))
            .filter(() => !gameOver() && !pause())
            .subscribe(() => {
                const bullet = new Elem(svg, "circle", bullets.elem)
                    .attr("r", "3")
                    .attr("fill", "#ffebe8")
                    .setTranslate(enemyShip.getTranslateX(), enemyShip.getTranslateY())
                    .setRotate(enemyShip.getRotate())
                    .move(-17, canvas)

                moveBullet(bullet); // so that it shoots faster
                moveBullet(bullet); // while being able to reuse the same function

                // check if enemy bullet hit player shit
                Observable.interval(30)
                .takeUntil(Observable.interval(1).filter(() => bullet.attr("r") == "0"))
                .takeUntil(restartO)
                .filter(() => distance(bullet, target) < 300)
                .subscribe(() => {
                    useContainedElem(heartContainer).removePoly();
                    resumeFrame.attr("style", "fill:red;fill-opacity:0.3");
                    Observable.interval(120)
                        .takeUntil(Observable.interval(120))
                        .subscribe(e => undefined, () => resumeFrame.attr("style", "fill:red;fill-opacity:0"))
                        // create red screen flash when player is hit
                }, () => bullet.attr("r", "0"))
             })
    }


    /**
    * Remove all child of a SVG group element
    * @param group a SVG group element that child nodes have to be removed
    */
    const removeGroup = (group: Elem): void => {
        if (group.elem.firstChild) {
            group.elem.removeChild(group.elem.firstChild);
            removeGroup(group);
        }
    }


    /**
    * Remove all enemies and inventory item from the map, position the ship at the 
    * middle of the canvas, reset hearts and energy bars, and set score and level to 0
    */
    const createStartEnvironment = (): void => {

        // clear the map
        removeGroup(enemy);
        removeGroup(inventoryHeart);

        // reset ship to initial state
        ship
            .setPointsPoly([-13, 20], [13, 20], [0, -20])
            .setTranslate(0, 0)
            .rotate(-ship.getRotate());

        restartHeart(heartContainer);

        clearEnergy(energyContainer, getEnergyCount(energyContainer));

        setIdVal("score", 0);
        setIdVal("level", 0);
    }


    /**
    * Start a round of asteroid game
    * @param player ship element that the player controls
    * @param lvl number representing the level to start the game with
    */
    const start = (player: Elem, lvl: number): void => {

        pauseFrame.hideFrame(); //remove pause frame
        resumeFrame.showFrame(canvas); //to enable game to be paused

        incrementID("level", lvl); //set initial level

        const scoreOffSet = (lvl - 1) * 20 + ((lvl - 1)? 1 : 0); 
        // adjust game according to which level player selects to start with

        const keydown = Observable
            .fromEvent<KeyboardEvent>(document, "keydown")
            .takeUntil(gameOverO)
            .filter(() => !pause() && !gameOver());

        keydown.filter(event => event.keyCode == 38).subscribe(() => player.move(-10 - getValById("level"), canvas));
        keydown.filter(event => event.keyCode == 40).subscribe(() => player.move(10 + getValById("level"), canvas));
        keydown.filter(event => event.keyCode == 37).subscribe(() => player.rotate(-10));
        keydown.filter(event => event.keyCode == 39).subscribe(() => player.rotate(10));
        keydown.filter(event => event.keyCode == 32).subscribe(() => attack(player));
        keydown
            .filter(event => event.keyCode == 65)
            .filter(() => getEnergyCount(energyContainer) >= 5)
            .subscribe(() => skilledAttack(player));
            // only enable skilled attack when there is at least 5 energy

        const levelUp = (x: number) => Observable.interval(1).filter(() => (getValById("score") + scoreOffSet) > x);

        createSmallAsteroid(ship)
        createSmallAsteroid(ship)
        createBigAsteroid(ship)
        createEnemyShip(ship)

        const run = (ms: number) : (() => void) =>
            Observable.interval(ms)
                .takeUntil(gameOverO)
                .takeUntil(levelUp(ms > 800? ((Math.floor((8000 - ms) / 900) + 1) * 20) : 10e6))
                // when level up, stop the current run, then run again with different difficulty,
                // i.e., astroids are created more frequently at higher level
                .filter(() => !gameOver() && !pause())
                .subscribe(() => {
                    createSmallAsteroid(player);
                    Math.random() > 0.5? createBigAsteroid(player) : createSmallAsteroid(player);
                }, () => { 
                    if (!gameOver()) {
                        incrementID("level", 1);
                        createEnemyShip(player);
                        run((8000 - Math.floor((getValById("score") + scoreOffSet) / 20) * 900));       
                    }
                });
                
        run(8000 - Math.floor((getValById("score") + scoreOffSet) / 20) * 900);   
    }


    const 
        // parent node of the player's ship so that the ship's orgin is at the 
        // middle of the canvas
        g = new Elem(svg,'g')
            .setTranslate(canvas.width / 2, canvas.height / 2),
    
        // parent node of SVG elements that represent bullets  
        // the bullets' orgin is in the middle of the canvas
        bullets = new Elem(svg, 'g')
            .attr("fill", "#87adad")
            .setTranslate(canvas.width / 2, canvas.height / 2),
         
        // parent node of SVG elements that represent asteroids and enemy ship
        // the enemy orgin is in the middle of the canvas
        enemy = new Elem(svg, 'g')
            .attr("style", "fill:#474742;stroke:#f7f7f0;stroke-width:3;fill-opacity:0.9")
            .setTranslate(canvas.width / 2, canvas.height / 2),

        // parent node of SVG elements that represent hearts in the hitpoints bar,
        // the hearts' orgin is at the top right of the canvas
        heart = new Elem(svg, 'g')
            .attr("style", "fill:red;fill-opacity:0.5;stroke:white;stroke-width:2")
            .setTranslate(canvas.width - 40, 40),

        // parent node of SVG elements that represent hearts that can be collected
        // the hearts' orgin is in the middle of the canvas
        inventoryHeart = new Elem(svg, 'g')
            .attr("style", "fill:red;fill-opacity:0.5;stroke:white;stroke-width:2")
            .setTranslate(canvas.width / 2, canvas.height / 2),

        // parent node of SVG elements that represent energy bars,
        // the energy bars' orgin is at the top left of the canvas
        energyBars = new Elem(svg, 'g')
            .setTranslate(35, 37),

        // parent node of SVG elements that represent frames that can overlay canvas
        frame = new Elem(svg, 'g')
            .setTranslate(0, 0),   

        // ship controlled by player
        ship = new Elem(svg, 'polygon', g.elem)
            .attr("style", "fill:#84e1e1;stroke:white;stroke-width:0") 
            .setPointsPoly([-13, 20], [13, 20], [0, -20])
            .setTranslate(0, 0),

        // draw a boarder to contain the energy bars
        barBoarder = new Elem(svg, 'rect')
            .attr("style", "fill-opacity:0;stroke:white;stroke-width:2")
            .setTranslate(30, 33)
            .attr("height", "16")
            .attr("width", "258"), 

        // draw a frame that overlays the canvas that will start the game when 
        // clicked if there is no ongoing game; otherwise, pause the game
        resumeFrame = new Elem(svg, 'rect', frame.elem)
            .showFrame(canvas)
            .attr("style", "fill:red;fill-opacity:0"),

        // draw a frame that overlays the canvas that will continue the game when 
        // clicked if the game is paused
        pauseFrame = new Elem(svg, 'rect', frame.elem) 
            .showFrame(canvas)
            .attr("style", "fill:black;fill-opacity:0.4"), 

        // draw a frame that overlays the canvas that indicates game over and 
        // get the game ready to be restarted when clicked, it is hidden at first
        gameOverFrame = new Elem(svg, 'rect', frame.elem) 
            .showFrame(canvas)
            .hideFrame()
            .attr("style", "fill:red;fill-opacity:0.5"),

        // initiate a hit points of 5
        heartContainer = createHearts(5),

        // create 30 bullets that can be reused during attack
        bulletContainer = createBullets(30),

        // create 10 empty energy bars
        energyContainer = createEnergyBars(10)


    /**
    * Determine if the game is paused
    * @returns true if the game is paused, false otherwise
    */
    const pause = (): boolean => parseInt(pauseFrame.attr("height")) == canvas.height


    /**
    * Determine if the game is over
    * @returns true if the game is over, false otherwise
    */
    const gameOver = (): boolean => heartContainer[0].isRemovedPoly()


    // creates different observables that notify when the game is in different states
    const
        pauseO = resumeFrame.observe<MouseEvent>("mousedown"),
        resumeO = pauseFrame.observe<MouseEvent>("mousedown"),
        gameOverO = Observable.interval(1).filter(() => gameOver() && !pause()),
        restartO = gameOverFrame.observe<MouseEvent>("mousedown")


    // when game is paused, overlays canvas with pause frame that can be clicked 
    // to resume game
    pauseO.subscribe(() => pauseFrame.showFrame(canvas))

    // if there is an ongoing game and the canvas is clicked, pause the game
    resumeO.filter(() => getValById("level") > 0)
        .subscribe(() => pauseFrame.hideFrame())

    // when the game is over, make the ship disappear and show the game over frame
    // that overlays the canvas
    gameOverO.subscribe(() => {
            ship.removePoly();
            resumeFrame.hideFrame();
            gameOverFrame.showFrame(canvas);               
        })

    // when the game over frame is clicked, reset the game environment
    restartO.subscribe(() => {
        gameOverFrame.hideFrame();
        pauseFrame.showFrame(canvas);
        createStartEnvironment();
    })


    // prepare game environment
    createStartEnvironment();

    // create an observable that notifies when any of the "1" to "9" keyboard key
    // is pressed and start the game at respective level if there is no ongoing game
    Observable
        .fromEvent<KeyboardEvent>(document, "keydown")
        .filter(() => getValById("level") == 0) 
        // level 0 indicates there is no ongoing game
        .map(event => event.keyCode - 48)
        .filter(lvl => 1 <= lvl && lvl <= 9)
        .subscribe(lvl => start(ship, lvl));

    // if there is no ongoing game and the canvas is clicked, start a game at level 1
    resumeO.filter(() => getValById("level") == 0)
        .subscribe(() => start(ship, 1))


}


// runs asteroids function on window load
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    }

