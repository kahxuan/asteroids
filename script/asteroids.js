"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    const canvas = { width: parseInt(svg.getAttribute("width")),
        height: parseInt(svg.getAttribute("height")) };
    const randomize = (range) => (x) => x + Math.random() * range - range / 2;
    const getValById = (id) => parseInt(document.getElementById(id).innerHTML);
    const setIdVal = (id, x) => document.getElementById(id).innerHTML = String(x);
    const incrementID = (id, x) => setIdVal(id, getValById(id) + x);
    const distance = (e1, e2) => Math.pow(e1.getTranslateX() - e2.getTranslateX(), 2) +
        Math.pow(e1.getTranslateY() - e2.getTranslateY(), 2);
    const createHearts = (n, container = []) => n ? createHearts(n - 1, container.concat(new Elem(svg, 'polygon', heart.elem)
        .setPointsPoly([-12, 0], [-9, -6], [-6, -6], [0, 0], [6, -6], [9, -6], [12, 0], [0, 13])
        .setTranslate((-n + 1) * 40, 0))) : container;
    const restartHeart = (container) => {
        const arrangeHearts = () => {
            if (container[container.length - 1].getTranslateX() < container[0].getTranslateX()) {
                useContainedElem(container);
                arrangeHearts();
            }
        };
        arrangeHearts();
        refillHearts(heartContainer, heartContainer.length);
    };
    const createBullets = (n, container = []) => n ? createBullets(n - 1, container.concat(new Elem(svg, "circle", bullets.elem)
        .attr("r", "0"))) : container;
    const createEnergyBars = (n, container = []) => n ? createEnergyBars(n - 1, container.concat(new Elem(svg, "rect", energyBars.elem)
        .attr("style", `fill:rgb(${80 + n * 50},${255 - n * 17},100);stroke-width:0`)
        .attr("fill-opacity", "0.1")
        .setTranslate(container.length * 25, 0)
        .attr("height", "7")
        .attr("width", "23"))) : container;
    const getEnergyCount = (container) => container
        .map((e) => parseFloat(e.attr("fill-opacity")))
        .reduce((total, cur) => total + (cur > 0.7 - 1e-10 ? 1 : 0), 0);
    const useContainedElem = (container) => container[container.push(container.shift()) - 1];
    const clearEnergy = (container, n) => {
        if (n && getEnergyCount(container) > 0) {
            container.unshift(container.pop());
            container[0].attr("fill-opacity", "0.1");
            return clearEnergy(container, n - 1);
        }
    };
    const refillHearts = (container, n) => {
        if (n && container[container.length - 1].isRemovedPoly()) {
            container.unshift(container.pop());
            container[0].setPointsPoly([-12, 0], [-9, -6], [-6, -6], [0, 0], [6, -6], [9, -6], [12, 0], [0, 13]);
            return refillHearts(container, n - 1);
        }
    };
    const moveBullet = (bullet) => Observable.interval(15)
        .takeUntil(Observable.interval(700))
        .subscribe(() => {
        bullet.move(-5, canvas);
    }, () => bullet.attr("r", 0));
    const attack = (elem) => moveBullet(useContainedElem(bulletContainer)
        .attr("r", "3")
        .setTranslate(elem.getTranslateX(), elem.getTranslateY())
        .setRotate(elem.getRotate())
        .move(-17, canvas));
    const skilledAttack = (elem) => {
        const rotateAndAttack = (deg) => moveBullet(useContainedElem(bulletContainer)
            .setTranslate(elem.getTranslateX(), elem.getTranslateY())
            .attr("r", "3")
            .rotate(deg));
        Observable.interval(10)
            .takeUntil(Observable.interval(1000))
            .subscribe(n => rotateAndAttack(n * 5), () => clearEnergy(energyContainer, 5));
    };
    const destroyedO = (rock) => Observable.interval(1)
        .filter(() => !enemy.elem.contains(rock.elem) ||
        rock.attr("points") == "0,0 2,0 2,2 0,2");
    const moveAsteroid = (rock) => Observable.interval(50)
        .takeUntil(destroyedO(rock))
        .filter(() => !pause())
        .subscribe(() => rock
        .move(-3.5 - getValById("level") / 2, canvas)
        .rotate((Math.random() > 0.8 ? Math.random() * 30 - 15 : 0)));
    const makeDamageable = (r) => (rock, target) => Observable.interval(1)
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
            .subscribe(e => undefined, () => resumeFrame.attr("style", "fill:red;fill-opacity:0"));
    });
    const mortalise = (r) => (rock, cleanUp) => Observable.interval(1)
        .takeUntil(destroyedO(rock))
        .takeUntil(restartO)
        .filter(() => bulletContainer
        .filter(b => parseInt(b.attr("r")) > 0)
        .some(b => distance(rock, b) < r))
        .subscribe(cleanUp);
    const createSmallAsteroid = (target, init) => {
        const r = randomize(10);
        const rock = new Elem(svg, "polygon", enemy.elem)
            .setPointsPoly([r(15.5), r(9)], [r(0), r(18)], [r(-15.5), r(9)], [r(-15.5), r(-9)], [r(0), r(-18)], [r(15.5), r(-9)]);
        init ? rock.setTranslate(init.x + Math.random() * 10, init.y + Math.random() * 10) :
            Math.random() < 0.5 ?
                rock.setTranslate(canvas.width / 2, Math.random() * canvas.height - canvas.height / 2) :
                rock.setTranslate(Math.random() * canvas.width - canvas.width / 2, canvas.height / 2);
        rock.setRotate(Math.random() * 360);
        const cleanUp = () => {
            incrementID("score", 2);
            rock.setPointsPoly([0, 0], [2, 0], [2, 2], [0, 2]);
            Observable.interval(1)
                .takeUntil(Observable.interval(1).filter(() => !enemy.elem.contains(rock.elem)))
                .filter(() => distance(rock, target) < 300)
                .subscribe(() => {
                enemy.elem.removeChild(rock.elem);
                incrementID("score", 1);
                getEnergyCount(energyContainer) < energyContainer.length ?
                    useContainedElem(energyContainer).attr("fill-opacity", "0.7") :
                    undefined;
            });
            if (Math.random() > 0.9) {
                const heart = new Elem(svg, 'polygon', inventoryHeart.elem)
                    .setPointsPoly([-12, 0], [-9, -6], [-6, -6], [0, 0], [6, -6], [9, -6], [12, 0], [0, 13])
                    .setTranslate(randomize(20)(rock.getTranslateX()), randomize(20)(rock.getTranslateY()));
                Observable.interval(1)
                    .takeUntil(restartO)
                    .takeUntil(Observable.interval(1).filter(() => !inventoryHeart.elem.contains(heart.elem)))
                    .filter(() => distance(heart, target) < 300)
                    .subscribe(() => {
                    inventoryHeart.elem.removeChild(heart.elem);
                    refillHearts(heartContainer, 1);
                });
            }
        };
        moveAsteroid(rock);
        makeDamageable(1200)(rock, target);
        mortalise(800)(rock, cleanUp);
    };
    const createBigAsteroid = (target) => {
        const r = randomize(20);
        const bigRock = new Elem(svg, "polygon", enemy.elem)
            .attr("style", "fill:#6b6b47;stroke:#f7f7f0;stroke-width:3")
            .setPointsPoly([r(35.5), r(20.5)], [r(0), r(41)], [r(-35.5), r(20.5)], [r(-35.5), r(-20.5)], [r(0), r(-41)], [r(35.5), r(-20.5)]);
        Math.random() < 0.5 ?
            bigRock.setTranslate(canvas.width / 2, Math.random() * canvas.height - canvas.height / 2) :
            bigRock.setTranslate(Math.random() * canvas.width - canvas.width / 2, canvas.height / 2);
        const cleanUp = () => {
            enemy.elem.removeChild(bigRock.elem);
            const coord = { x: bigRock.getTranslateX(),
                y: bigRock.getTranslateY() };
            Observable.interval(200)
                .takeUntil(Observable.interval(250))
                .subscribe((e) => e, () => {
                createSmallAsteroid(target, coord);
                createSmallAsteroid(target, coord);
                createSmallAsteroid(target, coord);
            });
        };
        moveAsteroid(bigRock);
        makeDamageable(2500)(bigRock, target);
        mortalise(2100)(bigRock, cleanUp);
    };
    const createEnemyShip = (target) => {
        const enemyShip = new Elem(svg, 'polygon', enemy.elem)
            .attr("style", "fill:#ff8573;stroke:white;stroke-width:0")
            .setPointsPoly([-13, 20], [13, 20], [0, -20]);
        Math.random() < 0.5 ?
            enemyShip.setTranslate(canvas.width / 2, Math.random() * canvas.height - canvas.height / 2) :
            enemyShip.setTranslate(Math.random() * canvas.width - canvas.width / 2, canvas.height / 2);
        enemyShip.setRotate(Math.random() * 360);
        Observable.interval(50)
            .takeUntil(destroyedO(enemyShip))
            .filter(() => !pause())
            .subscribe(() => {
            const toTurn = Math.atan2(-target.getTranslateY() + enemyShip.getTranslateY(), -target.getTranslateX() + enemyShip.getTranslateX()) * 180 / Math.PI - 90 - enemyShip.getRotate();
            enemyShip.move(-3.5 - getValById("level") / 2, canvas);
            enemyShip.rotate(Math.random() > (0.7 - getValById("level") / 20) ?
                (toTurn >= 0 ? Math.min(5, toTurn) : Math.max(-5, toTurn)) : 0);
        });
        makeDamageable(1000)(enemyShip, target);
        mortalise(600)(enemyShip, () => enemy.elem.removeChild(enemyShip.elem));
        Observable.interval(500 - getValById("level") * 10)
            .takeUntil(Observable.interval(1).filter(() => !enemy.elem.contains(enemyShip.elem)))
            .filter(() => !gameOver() && !pause())
            .subscribe(() => {
            const bullet = new Elem(svg, "circle", bullets.elem)
                .attr("r", "3")
                .attr("fill", "#ffebe8")
                .setTranslate(enemyShip.getTranslateX(), enemyShip.getTranslateY())
                .setRotate(enemyShip.getRotate())
                .move(-17, canvas);
            moveBullet(bullet);
            moveBullet(bullet);
            Observable.interval(30)
                .takeUntil(Observable.interval(1).filter(() => bullet.attr("r") == "0"))
                .takeUntil(restartO)
                .filter(() => distance(bullet, target) < 300)
                .subscribe(() => {
                useContainedElem(heartContainer).removePoly();
                resumeFrame.attr("style", "fill:red;fill-opacity:0.3");
                Observable.interval(120)
                    .takeUntil(Observable.interval(120))
                    .subscribe(e => undefined, () => resumeFrame.attr("style", "fill:red;fill-opacity:0"));
            }, () => bullet.attr("r", "0"));
        });
    };
    const removeGroup = (group) => {
        if (group.elem.firstChild) {
            group.elem.removeChild(group.elem.firstChild);
            removeGroup(group);
        }
    };
    const createStartEnvironment = () => {
        removeGroup(enemy);
        removeGroup(inventoryHeart);
        ship
            .setPointsPoly([-13, 20], [13, 20], [0, -20])
            .setTranslate(0, 0)
            .rotate(-ship.getRotate());
        restartHeart(heartContainer);
        clearEnergy(energyContainer, getEnergyCount(energyContainer));
        setIdVal("score", 0);
        setIdVal("level", 0);
    };
    const start = (player, lvl) => {
        pauseFrame.hideFrame();
        resumeFrame.showFrame(canvas);
        incrementID("level", lvl);
        const scoreOffSet = (lvl - 1) * 20 + ((lvl - 1) ? 1 : 0);
        const keydown = Observable
            .fromEvent(document, "keydown")
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
        const levelUp = (x) => Observable.interval(1).filter(() => (getValById("score") + scoreOffSet) > x);
        createSmallAsteroid(ship);
        createSmallAsteroid(ship);
        createBigAsteroid(ship);
        createEnemyShip(ship);
        const run = (ms) => Observable.interval(ms)
            .takeUntil(gameOverO)
            .takeUntil(levelUp(ms > 800 ? ((Math.floor((8000 - ms) / 900) + 1) * 20) : 10e6))
            .filter(() => !gameOver() && !pause())
            .subscribe(() => {
            createSmallAsteroid(player);
            Math.random() > 0.5 ? createBigAsteroid(player) : createSmallAsteroid(player);
        }, () => {
            if (!gameOver()) {
                incrementID("level", 1);
                createEnemyShip(player);
                run((8000 - Math.floor((getValById("score") + scoreOffSet) / 20) * 900));
            }
        });
        run(8000 - Math.floor((getValById("score") + scoreOffSet) / 20) * 900);
    };
    const g = new Elem(svg, 'g')
        .setTranslate(canvas.width / 2, canvas.height / 2), bullets = new Elem(svg, 'g')
        .attr("fill", "#87adad")
        .setTranslate(canvas.width / 2, canvas.height / 2), enemy = new Elem(svg, 'g')
        .attr("style", "fill:#474742;stroke:#f7f7f0;stroke-width:3;fill-opacity:0.9")
        .setTranslate(canvas.width / 2, canvas.height / 2), heart = new Elem(svg, 'g')
        .attr("style", "fill:red;fill-opacity:0.5;stroke:white;stroke-width:2")
        .setTranslate(canvas.width - 40, 40), inventoryHeart = new Elem(svg, 'g')
        .attr("style", "fill:red;fill-opacity:0.5;stroke:white;stroke-width:2")
        .setTranslate(canvas.width / 2, canvas.height / 2), energyBars = new Elem(svg, 'g')
        .setTranslate(35, 37), frame = new Elem(svg, 'g')
        .setTranslate(0, 0), ship = new Elem(svg, 'polygon', g.elem)
        .attr("style", "fill:#84e1e1;stroke:white;stroke-width:0")
        .setPointsPoly([-13, 20], [13, 20], [0, -20])
        .setTranslate(0, 0), barBoarder = new Elem(svg, 'rect')
        .attr("style", "fill-opacity:0;stroke:white;stroke-width:2")
        .setTranslate(30, 33)
        .attr("height", "16")
        .attr("width", "258"), resumeFrame = new Elem(svg, 'rect', frame.elem)
        .showFrame(canvas)
        .attr("style", "fill:red;fill-opacity:0"), pauseFrame = new Elem(svg, 'rect', frame.elem)
        .showFrame(canvas)
        .attr("style", "fill:black;fill-opacity:0.4"), gameOverFrame = new Elem(svg, 'rect', frame.elem)
        .showFrame(canvas)
        .hideFrame()
        .attr("style", "fill:red;fill-opacity:0.5"), heartContainer = createHearts(5), bulletContainer = createBullets(30), energyContainer = createEnergyBars(10);
    const pause = () => parseInt(pauseFrame.attr("height")) == canvas.height;
    const gameOver = () => heartContainer[0].isRemovedPoly();
    const pauseO = resumeFrame.observe("mousedown"), resumeO = pauseFrame.observe("mousedown"), gameOverO = Observable.interval(1).filter(() => gameOver() && !pause()), restartO = gameOverFrame.observe("mousedown");
    pauseO.subscribe(() => pauseFrame.showFrame(canvas));
    resumeO.filter(() => getValById("level") > 0)
        .subscribe(() => pauseFrame.hideFrame());
    gameOverO.subscribe(() => {
        ship.removePoly();
        resumeFrame.hideFrame();
        gameOverFrame.showFrame(canvas);
    });
    restartO.subscribe(() => {
        gameOverFrame.hideFrame();
        pauseFrame.showFrame(canvas);
        createStartEnvironment();
    });
    createStartEnvironment();
    Observable
        .fromEvent(document, "keydown")
        .filter(() => getValById("level") == 0)
        .map(event => event.keyCode - 48)
        .filter(lvl => 1 <= lvl && lvl <= 9)
        .subscribe(lvl => start(ship, lvl));
    resumeO.filter(() => getValById("level") == 0)
        .subscribe(() => start(ship, 1));
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map