if (WEBGL.isWebGLAvailable() === false) {

    document.body.appendChild(WEBGL.getWebGLErrorMessage());

}

var SEPARATION = 100, AMOUNTX = 150, AMOUNTY = 150;

var container, stats;
var camera, scene, renderer;

var particles,numParticles, count = 0;

var mouseX = 0, mouseY = -400;
var FPS = 60;
var maxSizeX = 0, maxSizeY= 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

function calcFPS(opts){
    var requestFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
    if (!requestFrame) return true; // Check if "true" is returned; 
                                    // pick default FPS, show error, etc...
    function checker(){
        if (index--) requestFrame(checker);
        else {
            // var result = 3*Math.round(count*1000/3/(performance.now()-start));
            var result = count*1000/(performance.now()- start);
            if (typeof opts.callback === "function") opts.callback(result);
            console.log("Calculated: "+result+" frames per second");
        }
    }
    if (!opts) opts = {};
    var count = opts.count||60, index = count, start = performance.now();
    checker();
}

init();
animate();

function init() {

    container = document.getElementById('back');
    var err = calcFPS({count: 120, callback: fps => FPS = fps});

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    camera.position.y = 1000;
    camera.position.x = 1000;
    scene = new THREE.Scene();

    //

    numParticles = AMOUNTX * AMOUNTY;

    var positions = new Float32Array(numParticles * 3);
    var colors = new Float32Array(numParticles * 3);
    var scales = new Float32Array(numParticles);

    var i = 0, j = 0;
    var color = new THREE.Color();
    var h, s, l;

    maxSizeX = AMOUNTX * SEPARATION
    maxSizeY = AMOUNTY * SEPARATION

    for (var ix = 0; ix < AMOUNTX; ix++) {
        h = ix / AMOUNTX;
        s = THREE.Math.randFloat(0.4, 0.6);
        l = THREE.Math.randFloat(0.4, 0.6);
        color.setHSL(h, s, l);

        for (var iy = 0; iy < AMOUNTY; iy++) {

            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
            positions[i + 1] = 0; // y
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z

            scales[j] = 1;
            colors[i + 0] = color.r
            colors[i + 1] = color.g
            colors[i + 2] = color.b
            i += 3;
            j++;

        }

    }

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

    var material = new THREE.ShaderMaterial({

        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        vertexColors: THREE.VertexColors
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    var hemisphereLight = new THREE.HemisphereLight(0xe3feff, 0xe6ddc8, 0.7);
    scene.add(hemisphereLight)
    //
    hemisphereLight.position.y = 300;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    //

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function onDocumentMouseMove(event) {

    mouseX = windowHalfX - event.clientX ;
    mouseY = windowHalfY - event.clientY ;
    if (mouseY > -400) {
        mouseY = -400
    }

}

function onDocumentTouchStart(event) {

    if (event.touches.length === 1) {

        event.preventDefault();

        mouseX =  windowHalfX - event.touches[0].pageX;
        mouseY =  windowHalfY - event.touches[0].pageY;

    }

}

function onDocumentTouchMove(event) {

    if (event.touches.length === 1) {

        event.preventDefault();

        mouseX =  windowHalfX - event.touches[0].pageX;
        mouseY =  windowHalfY - event.touches[0].pageY;

    }

}

//

function animate() {

    requestAnimationFrame(animate);

    render();
    // stats.update();

}

function render() {

    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (- mouseY - camera.position.y) * .05;
    camera.lookAt(scene.position);

    var positions = particles.geometry.attributes.position.array;
    var scales = particles.geometry.attributes.scale.array;
    var colors =  particles.geometry.attributes.color.array;

    // buffer color
    var color = new THREE.Color();
    var h, s, l;

    var i = 0, j = 0;
    var ampl = 50;
    for (var ix = 0; ix < AMOUNTX; ix++) {
        
        // h = ix / AMOUNTX;
        // s = THREE.Math.randFloat(0.4, 0.6);
        // l = THREE.Math.randFloat(0.4, 0.6);
        // color.setHSL(h, s, l);

        for (var iy = 0; iy < AMOUNTY; iy++) {
            
            

            positions[i + 1] = (Math.sin((ix + count) * 0.3) * ampl) +
                (Math.sin((iy + count) * 0.5) * ampl);

            h = (positions[i + 1] + ampl) / (2*ampl);
            s = 1.0;
            
            l = ( positions[i+2] + maxSizeY ) / (3 * maxSizeY );
            // l = 0.5
            color.setHSL(h, s, l);
            scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 8 +
                (Math.sin((iy + count) * 0.5) + 1) * 8;
            
            colors[i + 0] = color.r
            colors[i + 1] = color.g
            colors[i + 2] = color.b
            i += 3;
            j++;

        }

    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);

    count += 0.05 * ( 60.0/ FPS);

}