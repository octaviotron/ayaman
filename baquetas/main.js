import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

class App {
    constructor() {
        this.container = document.getElementById('container');
        this.tooltip = document.getElementById('tooltip');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        // Raycaster for mouseover
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Settings
        this.velocity = 0;
        this.targetVelocity = 2; // Rotation speed

        this.init();
    }

    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);

        // Camera setup
        this.camera.position.set(4, 3, 6);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        // Lights
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
        this.scene.add(hemiLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 250);
        spotLight.position.set(5, 10, 5);
        spotLight.angle = 0.6;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        this.scene.add(spotLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(-5, 5, -5);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x00f2ff, 30, 20);
        pointLight.position.set(-2, 2, 2);
        this.scene.add(pointLight);

        // Check for file protocol
        if (window.location.protocol === 'file:') {
            const warning = document.createElement('div');
            warning.style.position = 'absolute';
            warning.style.top = '20px';
            warning.style.left = '50%';
            warning.style.transform = 'translateX(-50%)';
            warning.style.padding = '15px 30px';
            warning.style.background = 'rgba(255, 50, 50, 0.8)';
            warning.style.color = 'white';
            warning.style.borderRadius = '50px';
            warning.style.zIndex = '1000';
            warning.style.fontFamily = 'sans-serif';
            warning.style.backdropFilter = 'blur(10px)';
            warning.innerText = '⚠️ Please run via local server (e.g. npx serve) to see the 3D model';
            document.body.appendChild(warning);
        }

        // Create the Lathe
        this.createLathe();

        // Events
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Start animation loop
        this.animate();
    }

    createLathe() {
        this.latheGroup = new THREE.Group();

        // Materials
        const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
        const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x757575, metalness: 0.9, roughness: 0.2 });
        const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.7, roughness: 0.5 });
        const beltMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1 });

        // 1. Bed
        const bedGeo = new THREE.BoxGeometry(8, 0.4, 0.4);
        const beam1 = new THREE.Mesh(bedGeo, woodMaterial);
        beam1.position.z = 0.3;
        beam1.name = "Bancada (Viga 1)";

        const beam2 = new THREE.Mesh(bedGeo, woodMaterial);
        beam2.position.z = -0.3;
        beam2.name = "Bancada (Viga 2)";
        this.latheGroup.add(beam1, beam2);

        // 2. Headstock
        const headstockBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.2), metalMaterial);
        headstockBase.position.set(-3.25, 0.75, 0);
        headstockBase.name = "Base del Cabezal";
        this.latheGroup.add(headstockBase);

        // 3. Spindle
        this.spindleGroup = new THREE.Group();
        this.spindleGroup.position.set(-3.25, 1, 0);

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 16), metalMaterial);
        shaft.rotation.z = Math.PI / 2;
        shaft.position.x = 1;
        shaft.name = "Eje del Cabezal";
        this.spindleGroup.add(shaft);

        this.spindlePulley = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32), metalMaterial);
        this.spindlePulley.rotation.z = Math.PI / 2;
        this.spindlePulley.position.x = -0.5;
        this.spindlePulley.name = "Polea del Cabezal";
        this.spindleGroup.add(this.spindlePulley);

        const chuck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 6), metalMaterial);
        chuck.rotation.z = Math.PI / 2;
        chuck.position.x = 0.5;
        chuck.name = "Mandril / Plato";
        this.spindleGroup.add(chuck);

        this.latheGroup.add(this.spindleGroup);

        // 4. Tailstock
        const tsGroup = new THREE.Group();
        tsGroup.position.set(3, 0, 0);

        const tsBase = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), darkMetalMaterial);
        tsBase.position.y = 0.5;
        tsBase.name = "Base del Contrapunto";
        tsGroup.add(tsBase);

        const tsPoint = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 16), metalMaterial);
        tsPoint.rotation.z = -Math.PI / 2;
        tsPoint.position.set(-0.5, 1, 0);
        tsPoint.name = "Punto Giratorio / Contrapunta";
        tsGroup.add(tsPoint);

        this.latheGroup.add(tsGroup);

        // 5. Motor
        this.motorGroup = new THREE.Group();
        this.motorGroup.position.set(-3.25, -0.8, -1.5);

        const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16), darkMetalMaterial);
        motorBody.rotation.z = Math.PI / 2;
        motorBody.name = "Motor Eléctrico";
        this.motorGroup.add(motorBody);

        this.motorPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 32), metalMaterial);
        this.motorPulley.rotation.z = Math.PI / 2;
        this.motorPulley.position.x = 0.7;
        this.motorPulley.name = "Polea del Motor";
        this.motorGroup.add(this.motorPulley);

        this.latheGroup.add(this.motorGroup);

        // 6. Belt
        const beltVisual = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 16, 100), beltMaterial);
        beltVisual.position.set(-3.75, 0.1, -0.75);
        beltVisual.rotation.y = Math.PI / 2;
        beltVisual.scale.set(1, 0.4, 1);
        beltVisual.name = "Correa de Transmisión";
        this.latheGroup.add(beltVisual);

        // 7. Wood Piece
        const woodPiece = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 5, 32), woodMaterial);
        woodPiece.rotation.z = Math.PI / 2;
        woodPiece.position.set(2.5, 0, 0);
        woodPiece.name = "Pieza de Trabajo (Madera)";
        this.spindleGroup.add(woodPiece);

        this.scene.add(this.latheGroup);
    }


    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update tooltip position
        this.tooltip.style.left = (event.clientX + 15) + 'px';
        this.tooltip.style.top = (event.clientY + 15) + 'px';
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.velocity = THREE.MathUtils.lerp(this.velocity, this.targetVelocity, 0.02);
        if (this.spindleGroup) this.spindleGroup.rotation.x += this.velocity * 2;
        if (this.motorPulley) this.motorPulley.rotation.x += this.velocity * 4;

        // Raycasting
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.latheGroup.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.name) {
                this.tooltip.style.display = 'block';
                this.tooltip.innerText = object.name;
            } else {
                this.tooltip.style.display = 'none';
            }
        } else {
            this.tooltip.style.display = 'none';
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

new App();
