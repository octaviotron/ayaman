/**
 * Baquetas Ayaman - 3D Wood Lathe Model
 * Copyright (C) 2026 Octavio Rossell <octavio.rossell@gmail.com> https://github.com/octaviotron/ayaman
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

class App {
    constructor() {
        this.container = document.getElementById('container');
        this.infoBox = document.getElementById('info-box');
        this.partNameDisplay = document.getElementById('part-name');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        // Raycaster for mouseover
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

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
        const lightMetalMaterial = new THREE.MeshStandardMaterial({ color: 0xd1d1d1, metalness: 0.9, roughness: 0.1 });
        const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.7, roughness: 0.5 });
        const beltMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1 });

        // 1. Bed
        const bedGeo = new THREE.BoxGeometry(9.5, 0.4, 0.4); // Extendido de 8 a 9.5
        const beam1 = new THREE.Mesh(bedGeo, lightMetalMaterial);
        beam1.position.set(0.75, 0, 0.3); // Desplazado un poco a la derecha para cubrir el contrapunto
        beam1.name = "Bancada (Viga 1)";

        const beam2 = new THREE.Mesh(bedGeo, lightMetalMaterial);
        beam2.position.set(0.75, 0, -0.3);
        beam2.name = "Bancada (Viga 2)";
        this.latheGroup.add(beam1, beam2);

        // 2. Headstock
        const headstockBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.2), lightMetalMaterial);
        headstockBase.position.set(-3.25, 0.75, 0);
        headstockBase.name = "Base del Cabezal";
        this.latheGroup.add(headstockBase);

        // Gizmo de Orientación (Flechas de dirección positiva)
        const gizmoGroup = new THREE.Group();
        gizmoGroup.position.set(-3.25, 1.5, 0); // En la cima de la base del cabezal

        // Eje X (Rojo)
        const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xff0000);
        arrowX.line.name = "Eje X+";
        gizmoGroup.add(arrowX);

        // Eje Y (Verde)
        const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x00ff00);
        arrowY.line.name = "Eje Y+";
        gizmoGroup.add(arrowY);

        // Eje Z (Azul)
        const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0x0000ff);
        arrowZ.line.name = "Eje Z+";
        gizmoGroup.add(arrowZ);

        this.latheGroup.add(gizmoGroup);

        // 3. Spindle
        this.spindleGroup = new THREE.Group();
        this.spindleGroup.position.set(-3.25, 1, 0);

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.5, 16), metalMaterial); // Más largo
        shaft.rotation.z = Math.PI / 2;
        shaft.position.x = 0.9; // Alineado con la nueva posición de la correa
        shaft.name = "Eje del Cabezal";
        this.spindleGroup.add(shaft);

        this.spindlePulley = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32), metalMaterial);
        this.spindlePulley.rotation.z = Math.PI / 2;
        this.spindlePulley.position.x = -0.9; // Alineado con X = -4.15
        this.spindlePulley.name = "Polea del Cabezal";
        this.spindleGroup.add(this.spindlePulley);

        const chuck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 6), metalMaterial);
        chuck.rotation.z = Math.PI / 2;
        chuck.position.x = 1.05;
        chuck.name = "Mandril / Plato";
        this.spindleGroup.add(chuck);

        // Punto de Arrastre (Drive Center)
        const driveCenter = new THREE.Group();
        driveCenter.position.set(1.4, 0, 0); // Justo después del plato

        const dcBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16), metalMaterial);
        dcBase.rotation.z = Math.PI / 2;
        dcBase.name = "Base del Punto de Arrastre";
        driveCenter.add(dcBase);

        const dcPoint = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 16), lightMetalMaterial);
        dcPoint.rotation.z = -Math.PI / 2;
        dcPoint.position.x = 0.2;
        dcPoint.name = "Punto de Arrastre (Punta)";
        driveCenter.add(dcPoint);

        this.spindleGroup.add(driveCenter);

        this.latheGroup.add(this.spindleGroup);

        // 4. Contrapunto (Tailstock)
        const tsGroup = new THREE.Group();
        tsGroup.position.set(4.0, 0, 0); // Movido a la derecha para dar espacio al rodamiento

        // Estructura de soporte del contrapunto
        const tsStructure = new THREE.Group();

        // Soportes laterales que bajan hasta las vigas
        const sideGeo = new THREE.BoxGeometry(0.8, 0.6, 0.15);
        const leftSup = new THREE.Mesh(sideGeo, metalMaterial);
        leftSup.position.set(0, 0.5, 0.35);
        leftSup.name = "Soporte Lateral Izquierdo";

        const rightSup = new THREE.Mesh(sideGeo, metalMaterial);
        rightSup.position.set(0, 0.5, -0.35);
        rightSup.name = "Soporte Lateral Derecho";

        // Placa superior donde se apoya el rodamiento
        const topPlate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 1.0), darkMetalMaterial);
        topPlate.position.y = 0.85;
        topPlate.name = "Placa Base del Rodamiento";

        tsStructure.add(leftSup, rightSup, topPlate);
        tsGroup.add(tsStructure);

        // Soporte del Rodamiento (Housing)
        const bearingHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 32), metalMaterial);
        bearingHousing.rotation.z = Math.PI / 2;
        bearingHousing.position.set(0, 1, 0);
        bearingHousing.name = "Soporte de Rodamiento";
        tsGroup.add(bearingHousing);

        // Rodamiento (Bearing) - Un anillo metálico
        const bearing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 16, 32), metalMaterial);
        bearing.position.set(-0.35, 1, 0);
        bearing.rotation.y = Math.PI / 2;
        bearing.name = "Rodamiento de Bolas";
        tsGroup.add(bearing);

        // Punta Giratoria (Live Center)
        const liveCenter = new THREE.Group();
        liveCenter.position.set(-0.4, 1, 0);

        const lcPoint = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 16), lightMetalMaterial);
        lcPoint.rotation.z = -Math.PI / 2;
        lcPoint.position.x = -0.2;
        lcPoint.name = "Punto Giratorio (Punta)";
        liveCenter.add(lcPoint);

        const lcBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16), metalMaterial);
        lcBase.rotation.z = Math.PI / 2;
        lcBase.name = "Base de la Punta";
        liveCenter.add(lcBase);

        tsGroup.add(liveCenter);
        this.latheGroup.add(tsGroup);

        // 5. Motor
        this.motorGroup = new THREE.Group();
        this.motorGroup.position.set(-3.25, -0.8, -1.5);
        this.motorGroup.rotation.y = Math.PI; // Rotación de 180 grados

        const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16), lightMetalMaterial);
        motorBody.rotation.z = Math.PI / 2;
        motorBody.name = "Motor Eléctrico (Cuerpo)";
        this.motorGroup.add(motorBody);

        // Eje del motor
        const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
        const motorShaft = new THREE.Mesh(shaftGeo, metalMaterial);
        motorShaft.rotation.z = Math.PI / 2;
        motorShaft.position.x = 0.8; // Sobresale del cuerpo
        motorShaft.name = "Eje del Motor";
        this.motorGroup.add(motorShaft);

        this.motorPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 32), metalMaterial);
        this.motorPulley.rotation.z = Math.PI / 2;
        this.motorPulley.position.x = 0.9; // Posicionada sobre el eje
        this.motorPulley.name = "Polea del Motor";
        this.motorGroup.add(this.motorPulley);

        this.latheGroup.add(this.motorGroup);

        // 6. Correa Simplificada (Loop)
        const beltVisual = new THREE.Mesh(
            new THREE.TorusGeometry(1.15, 0.04, 12, 48),
            beltMaterial
        );
        beltVisual.position.set(-4.15, 0.1, -0.75);
        // Primero lo ponemos en el plano YZ (rotando 90 en Y)
        // Luego lo giramos sobre su nuevo eje local Z para alinearlo con la pendiente
        const beltAngle = Math.atan2(1.5, 1.8);
        beltVisual.rotation.set(0, Math.PI / 2, beltAngle);
        // Escalamos en X (ahora apunta en Z world) e Y (world Y) para hacerlo ovalado
        beltVisual.scale.set(0.4, 1.1, 1);

        beltVisual.name = "Correa de Transmisión";
        this.latheGroup.add(beltVisual);

        // 7. Pieza de Madera
        const woodPiece = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 4.85, 32), woodMaterial);
        woodPiece.rotation.z = Math.PI / 2;
        woodPiece.position.set(4.125, 0, 0);
        woodPiece.name = "Pieza de Trabajo (Madera)";
        this.spindleGroup.add(woodPiece);

        // 8. Base Plana (Fundación)
        const baseGeo = new THREE.BoxGeometry(9.5, 0.1, 4.0); // Expandido de 2.8 a 4.0
        const basePlate = new THREE.Mesh(baseGeo, darkMetalMaterial);
        // Posicionada debajo de las vigas y expandida hacia el lado positivo Z
        basePlate.position.set(0.75, -0.25, -0.15); // Reajustado para cubrir motor y lado opuesto
        basePlate.name = "Base de la Bancada";
        this.latheGroup.add(basePlate);

        // 9. Sistema de Apoyo Dual (Banjo Doble)
        this.toolRestGroup = new THREE.Group();
        // Centrado con la pieza de madera (x = 0.875) y separado para mayor comodidad (z = 0.9)
        this.toolRestGroup.position.set(0.875, -0.2, 0.9);

        const createBanjoSupport = (xPos) => {
            const support = new THREE.Group();
            support.position.x = xPos;

            // Base vertical del soporte - Expandida hasta el borde de la base de la bancada
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 1.3), metalMaterial);
            base.position.set(0, 0.3, 0.3); // Desplazado en Z para alcanzar el borde
            base.name = "Soporte del Banjo (Cuerpo)";
            support.add(base);

            // Brazo que extiende el soporte hacia la madera - Bajado de 0.7 a 0.5
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.8), metalMaterial);
            arm.position.set(0, 0.5, -0.4);
            arm.name = "Brazo del Banjo";
            support.add(arm);

            // Poste 1 (Frontal - sobre el cuerpo) - Bajado de 0.9 a 0.7
            const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16), lightMetalMaterial);
            post1.position.set(0, 0.7, -0.25);
            post1.name = "Poste Frontal";
            support.add(post1);

            // Poste 2 (Trasero - sobre el cuerpo) - Bajado de 0.9 a 0.7
            const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16), lightMetalMaterial);
            post2.position.set(0, 0.7, 0.25);
            post2.name = "Poste Trasero";
            support.add(post2);

            return support;
        };

        // Añadir tres soportes: extremos (±2.5) y centro (0)
        this.toolRestGroup.add(createBanjoSupport(-2.5));
        this.toolRestGroup.add(createBanjoSupport(0));
        this.toolRestGroup.add(createBanjoSupport(2.5));

        // El Recliende (Soporte en T) compartido por los tres banjos - Bajado a 0.85
        const theRest = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.15, 0.7), lightMetalMaterial);
        theRest.position.set(0, 0.85, 0);
        theRest.name = "Apoyo en T (Base)";
        this.toolRestGroup.add(theRest);

        // Sistema de Rendija Vertical (Guía para herramientas) - Bajado a 0.925
        const slitGroup = new THREE.Group();
        // Posicionado exactamente sobre el borde frontal del apoyo
        slitGroup.position.set(0, 0.925, -0.3);

        const stripHeightY = 0.2;  // Grosor aumentado
        const slitHeightY = 0.15;  // Amplitud de la rendija
        const stripThicknessZ = 0.1;
        const stripGeo = new THREE.BoxGeometry(5.0, stripHeightY, stripThicknessZ);

        // Canto Inferior
        const stripBottom = new THREE.Mesh(stripGeo, metalMaterial);
        stripBottom.position.y = stripHeightY / 2;
        stripBottom.name = "Sistema de Rendija";
        slitGroup.add(stripBottom);

        // Canto Superior
        const stripTop = new THREE.Mesh(stripGeo, metalMaterial);
        stripTop.position.y = stripHeightY + slitHeightY + stripHeightY / 2;
        stripTop.name = "Sistema de Rendija";
        slitGroup.add(stripTop);

        // Conectores laterales (Extremos en X) que cierran la estructura verticalmente
        const connHeight = stripHeightY * 2 + slitHeightY;
        const connGeo = new THREE.BoxGeometry(0.1, connHeight, stripThicknessZ);

        const connLeft = new THREE.Mesh(connGeo, metalMaterial);
        connLeft.position.set(-2.45, connHeight / 2, 0);
        connLeft.name = "Sistema de Rendija";

        const connRight = new THREE.Mesh(connGeo, metalMaterial);
        connRight.position.set(2.45, connHeight / 2, 0);
        connRight.name = "Sistema de Rendija";

        slitGroup.add(connLeft, connRight);

        // Estructuras de Firmeza (Refuerzos triangulares / Escuadras)
        const createBrace = (xPos, isRight) => {
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.lineTo(0.4, 0); // Base sobre el recliende (un poco más larga)
            shape.lineTo(0, 0.55); // Altura total de la rendija
            shape.lineTo(0, 0);

            const braceGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
            const brace = new THREE.Mesh(braceGeo, metalMaterial);
            // Rotamos -90 grados en Y para que el triángulo refuerce hacia atrás
            brace.rotation.y = -Math.PI / 2;

            // Ajuste fino de posición:
            // xPos: -2.5 (Extrusion va a -2.4) o 2.4 (Extrusion va a 2.5) para quedar alineados con conectores
            // y: 0 para posarse sobre el recliende
            // z: 0.05 para empezar justo detrás de las barras verticales (que terminan en z=0.05)
            // xPos: 2.4 (Extrusion va hacia 2.3) o -2.4 (Extrusion va hacia -2.5)
            const finalX = xPos;
            brace.position.set(finalX, 0, 0.05);
            brace.name = "Sistema de Rendija";
            return brace;
        };

        slitGroup.add(createBrace(-2.4, false));
        slitGroup.add(createBrace(2.5, true));

        this.toolRestGroup.add(slitGroup);

        this.latheGroup.add(this.toolRestGroup);

        this.scene.add(this.latheGroup);
    }


    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Raycasting
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.latheGroup.children, true);

        if (intersects.length > 0) {
            let target = intersects[0].object;

            // Bubble up to find a named parent if the hit object itself is unnamed
            // or to treat the whole group as one logical unit
            while (target && !target.name && target.parent) {
                target = target.parent;
            }

            if (target && target.name) {
                this.partNameDisplay.innerText = target.name;
                this.infoBox.style.opacity = '1';
                this.infoBox.style.transform = 'translateX(0)';
            } else {
                this.infoBox.style.opacity = '0';
                this.infoBox.style.transform = 'translateX(20px)';
            }
        } else {
            this.infoBox.style.opacity = '0';
            this.infoBox.style.transform = 'translateX(20px)';
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

new App();
