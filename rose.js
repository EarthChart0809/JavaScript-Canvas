 import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // バラの花の初期化
        function initRose() {
            const canvas = document.getElementById('threejs-canvas');
            
            if (!canvas) {
                console.error('threejs-canvas が見つかりません');
                return;
            }

            // シーン・カメラ・レンダラー設定
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f8ff);

            const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
            camera.position.set(0, 5, 8);

            const renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true 
            });
            renderer.setSize(canvas.width, canvas.height);

            // OrbitControlsを追加
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;

            // ライト
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 10, 5);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0x404040, 0.6));

            // バラ全体のグループ
            const roseGroup = new THREE.Group();
            scene.add(roseGroup);

            // 花びらを生成する関数
            function createPetal(size, color, spiralAngle, radius, height) {
                const geometry = new THREE.SphereGeometry(size, 16, 8);
                const material = new THREE.MeshPhongMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide
                });
                
                const petal = new THREE.Mesh(geometry, material);
                
                // 花弁を薄く、湾曲させる
                petal.scale.set(1, 0.15, 0.8);
                
                // 螺旋状の位置計算
                petal.position.x = Math.cos(spiralAngle) * radius;
                petal.position.z = Math.sin(spiralAngle) * radius;
                petal.position.y = height;
                
                // 中心を向くように回転
                petal.rotation.y = spiralAngle + Math.PI;
                
                // 花弁の傾き（内側ほど立ち上がる）
                const tilt = Math.PI * 0.3 + (1 - radius / 2) * Math.PI * 0.4;
                petal.rotation.x = tilt;
                
                return petal;
            }

            // 黄金角（フィボナッチ螺旋）
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));
            const totalPetals = 30;
            
            // 螺旋状に花弁を配置
            for (let i = 0; i < totalPetals; i++) {
                const spiralAngle = i * goldenAngle;
                const radius = Math.sqrt(i) * 0.15 + 0.1;
                const normalizedIndex = i / totalPetals;
                const height = 0.3 - normalizedIndex * 0.5;
                const size = 0.3 + normalizedIndex * 0.4;
                
                // 色のグラデーション
                let color;
                if (normalizedIndex < 0.3) {
                    color = 0xffc0cb; // 淡いピンク
                } else if (normalizedIndex < 0.6) {
                    color = 0xffb6c1; // ピンク
                } else {
                    color = 0xff91a4; // 濃いピンク
                }
                
                const petal = createPetal(size, color, spiralAngle, radius, height);
                roseGroup.add(petal);
            }

            // 中心（花芯）部分
            const centerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            const centerMaterial = new THREE.MeshPhongMaterial({ color: 0xffff99 });
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            center.position.y = 0.1;
            roseGroup.add(center);

            // 茎
            const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 3);
            const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = -1.5;
            roseGroup.add(stem);

            // 葉っぱ
            for (let i = 0; i < 3; i++) {
                const leafGeometry = new THREE.CircleGeometry(0.3, 8);
                const leafMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x228b22,
                    side: THREE.DoubleSide 
                });
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                leaf.scale.y = 2; // 楕円形に
                leaf.position.y = -0.5 - i * 0.5;
                leaf.position.x = Math.sin(i * 2) * 0.8;
                leaf.rotation.z = i * 0.8;
                leaf.rotation.x = Math.PI / 2;
                roseGroup.add(leaf);
            }

            // アニメーション
            function animate() {
                requestAnimationFrame(animate);
                
                // コントロールを更新
                controls.update();
                
                // バラをゆっくり回転
                roseGroup.rotation.y += 0.005;
                
                renderer.render(scene, camera);
            }

            animate();
        }
        
        // バラの花を初期化
        initRose();