// earth.js - 修复版
console.log('🌍 Earth.js开始执行');

// 地球系统状态
let earthSystem = null;

// 主初始化函数
function initEarth() {
    console.log('🚀 开始初始化地球系统...');
    
    // 双重检查THREE是否存在
    if (typeof THREE === 'undefined') {
        console.error('❌ THREE仍未定义!');
        return false;
    }
    
    const canvas = document.getElementById('earth-canvas');
    if (!canvas) {
        console.warn('⚠️ 未找到地球Canvas元素');
        return false;
    }
    
    try {
        // 1. 基础设置
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        
        const renderer = new THREE.WebGLRenderer({ 
            canvas, 
            alpha: true, 
            antialias: true 
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // 2. 光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);
        

        // 3. 创建纹理加载器
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = "anonymous";

        // 4. 创建地球
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x2233ff,  // 默认蓝色
            specular: 0x333333,
            shininess: 10
        });
        const earth = new THREE.Mesh(geometry, material);
        scene.add(earth);

        // 5. 加载地球纹理 - 使用NASA源
        textureLoader.load(
            'https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg',
            function(texture) {
                console.log('✅ NASA地球纹理加载成功');
                earth.material.map = texture;
                earth.material.needsUpdate = true;
                earth.material.color.set(0xffffff); // 恢复白色，让纹理显示

                // ✅ 在这里调用addVegetationMarkers (earth可用)
                addVegetationMarkers(earth);
            },
            undefined,
            function(err) {
                console.warn('⚠️ NASA纹理加载失败,使用纯色地球');
                // 保持蓝色，但添加大洲轮廓
                addContinentOutlines(earth);
                
                // 可以尝试另一个备用源
                console.log('尝试备用纹理...');
                textureLoader.load(
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1024px-The_Earth_seen_from_Apollo_17.jpg',
                    function(backupTexture) {
                        earth.material.map = backupTexture;
                        earth.material.needsUpdate = true;
                        earth.material.color.set(0xffffff);
                    }
                );
            }
        );
     

        // 6. 创建云层
        let clouds = null;
        textureLoader.load(
            'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
            function(cloudTexture) {
                console.log('✅ 云层纹理加载成功');
                const cloudGeometry = new THREE.SphereGeometry(2.05, 64, 64);
                const cloudMaterial = new THREE.MeshPhongMaterial({
                    map: cloudTexture,
                    transparent: true,
                    opacity: 0.3
                });
                clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
                scene.add(clouds);
            },
            undefined,
            function(err) {
                console.warn('⚠️ 云层纹理加载失败，不显示云层');
            }
        );

        // 在initEarth中使用：
        const cloudMaterial = createDynamicClouds(scene);
        
        // 7. 点击交互
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([earth]);
            
            if (intersects.length > 0) {
                console.log('点击了地球位置:', intersects[0].point);
                showRegionInfo(intersects[0].point);
            }

        
        // 在earth.js的initEarth函数中添加

        // 创建CO₂浓度数据层
        function createCO2Heatmap(earth) {
            // CO₂浓度数据（示例数据）
            const co2Data = [
                { lat: 40, lng: -100, value: 420, region: "北美工业区" }, // ppm
                { lat: 50, lng: 10, value: 415, region: "欧洲" },
                { lat: 35, lng: 140, value: 425, region: "东亚工业区" },
                { lat: -30, lng: -60, value: 395, region: "亚马逊雨林" },
                { lat: 0, lng: 40, value: 410, region: "非洲" }
            ];
            
            co2Data.forEach(point => {
                // 创建数据点
                const size = (point.value - 390) / 10; // 大小根据浓度
                const color = getCO2Color(point.value);
                
                const geometry = new THREE.SphereGeometry(size * 0.05, 16, 16);
                const material = new THREE.MeshBasicMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: 0.7
                });
                const pointMesh = new THREE.Mesh(geometry, material);
                
                // 转换为3D坐标
                const phi = (90 - point.lat) * Math.PI / 180;
                const theta = (point.lng + 180) * Math.PI / 180;
                pointMesh.position.set(
                    Math.sin(phi) * Math.cos(theta) * 2.1,
                    Math.cos(phi) * 2.1,
                    Math.sin(phi) * Math.sin(theta) * 2.1
                );
                
                // 添加脉冲动画
                createPulseAnimation(pointMesh);
                
                pointMesh.userData = {
                    type: 'co2',
                    value: point.value,
                    region: point.region,
                    unit: 'ppm'
                };
                
                earth.add(pointMesh);
            });
        }

        // 根据CO₂浓度获取颜色
        function getCO2Color(value) {
            if (value < 400) return 0x4CAF50; // 绿色：安全
            if (value < 410) return 0xFFC107; // 黄色：警戒
            if (value < 420) return 0xFF9800; // 橙色：危险
            return 0xF44336; // 红色：严重
        }

        // 创建脉冲动画
        function createPulseAnimation(mesh) {
            let scale = 1;
            setInterval(() => {
                scale = scale === 1 ? 1.3 : 1;
                mesh.scale.set(scale, scale, scale);
            }, 1000);
        }


        });
        
        // 8. 添加控制器
        let controls = null;
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 3;
            controls.maxDistance = 10;
        }
        
        // 9. 动画循环
        let isRotating = true;
        function animate() {
            requestAnimationFrame(animate);
            
            // 地球自转
            if (isRotating) {
                earth.rotation.y += 0.002;
                
                // 云层旋转（如果存在）
                if (clouds) {
                    clouds.rotation.y += 0.0015;
                }
            }
            
            if (controls) {
                controls.update();
            }
            
            renderer.render(scene, camera);

            // 在animate函数中更新：
            cloudMaterial.uniforms.time.value += 0.005;
        }
        animate();
        
        // 10. 保存引用
        earthSystem = {
            scene,
            camera,
            renderer,
            earth,
            controls,
            clouds,
            isRotating: true
        };
        
        // 11. 设置控制按钮
        setupControls(earth, clouds);
        
        // 12. 响应式
        window.addEventListener('resize', function() {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });
        
        console.log('✅ 地球系统初始化完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 地球初始化失败:', error);
        return false;
    }
}

// 显示地区信息
function showRegionInfo(position) {
    // 将3D坐标转换为经纬度
    const lat = 90 - (Math.acos(position.y / 2) * 180 / Math.PI);
    const lng = (Math.atan2(position.z, position.x) * 180 / Math.PI);
    
    console.log(`🌍 点击位置：纬度 ${lat.toFixed(1)}°, 经度 ${lng.toFixed(1)}°`);
    
    // 显示在数据面板
    const panel = document.getElementById('data-panel');
    const name = document.getElementById('region-name');
    const data = document.getElementById('region-data');
    
    let regionName = "🌊 海洋区域";
    let regionData = "点击陆地查看植被详细信息";
    
    // 简单的地理判断
    if (lat > -30 && lat < 30 && lng > -80 && lng < -30) {
        regionName = "🌴 亚马逊雨林";
        regionData = "森林覆盖率: 85%<br>年碳吸收量: 12亿吨<br>主要植物: 热带阔叶林";
    } else if (lat > 0 && lat < 60 && lng > 90 && lng < 150) {
        regionName = "🌲 东南亚雨林";
        regionData = "森林覆盖率: 70%<br>年碳吸收量: 8亿吨<br>主要植物: 红树林、热带雨林";
    } else if (lat > 30 && lat < 60 && lng > -130 && lng < -60) {
        regionName = "🍂 北美温带林";
        regionData = "森林覆盖率: 45%<br>年碳吸收量: 6亿吨<br>主要植物: 针叶林、落叶林";
    } else if (lat > -40 && lat < -20 && lng > 110 && lng < 155) {
        regionName = "🌿 澳大利亚森林";
        regionData = "森林覆盖率: 35%<br>年碳吸收量: 4亿吨<br>主要植物: 桉树林";
    }
    
    name.innerHTML = regionName;
    data.innerHTML = regionData;
    panel.style.display = 'block';
    
    // 5秒后自动隐藏
    setTimeout(() => {
        panel.style.display = 'none';
    }, 5000);
}

// 控制按钮设置
function setupControls(earth, clouds) {
    const rotateBtn = document.getElementById('rotate-toggle');
    const resetBtn = document.getElementById('reset-view');
    
    if (rotateBtn) {
        let rotating = true;
        rotateBtn.addEventListener('click', function() {
            rotating = !rotating;
            earthSystem.isRotating = rotating;
            
            if (rotating) {
                this.innerHTML = '<i class="fas fa-pause"></i> 暂停';
            } else {
                this.innerHTML = '<i class="fas fa-play"></i> 旋转';
            }
        });
    }
    
    if (resetBtn && earthSystem && earthSystem.controls) {
        resetBtn.addEventListener('click', function() {
            earthSystem.controls.reset();
            earthSystem.camera.position.z = 5;
            earth.rotation.x = 0;
            earth.rotation.y = 0;
            
            if (clouds) {
                clouds.rotation.x = 0;
                clouds.rotation.y = 0;
            }
        });
    }
}


// 添加植被标记函数
function addVegetationMarkers(earth) {
    console.log('🌿 添加植被标记...');
    
    // 主要植被区域数据
    const vegetationSpots = [
        { lat: -3, lng: -60, name: "亚马逊雨林", type: "热带雨林", color: 0x4CAF50 },
        { lat: 0, lng: 20, name: "刚果盆地", type: "热带雨林", color: 0x4CAF50 },
        { lat: 10, lng: 105, name: "东南亚雨林", type: "热带雨林", color: 0x4CAF50 },
        { lat: 60, lng: 100, name: "西伯利亚泰加林", type: "针叶林", color: 0x8BC34A },
        { lat: 50, lng: -100, name: "北美寒带林", type: "针叶林", color: 0x8BC34A },
        { lat: -45, lng: 170, name: "新西兰森林", type: "温带雨林", color: 0x2196F3 },
        { lat: 35, lng: 100, name: "青藏高原草原", type: "高寒草原", color: 0xFFC107 }
    ];
    
    vegetationSpots.forEach(spot => {
        // 创建标记点
        const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: spot.color,
            transparent: true,
            opacity: 0.8
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        // 转换为3D坐标
        const phi = (90 - spot.lat) * Math.PI / 180;
        const theta = (spot.lng + 180) * Math.PI / 180;
        marker.position.set(
            Math.sin(phi) * Math.cos(theta) * 2.05,
            Math.cos(phi) * 2.05,
            Math.sin(phi) * Math.sin(theta) * 2.05
        );
        
        // 添加脉冲动画
        let scale = 1;
        setInterval(() => {
            scale = scale === 1 ? 1.3 : 1;
            marker.scale.set(scale, scale, scale);
        }, 1000);
        
        // 存储数据
        marker.userData = {
            type: 'vegetation',
            name: spot.name,
            vegetationType: spot.type,
            lat: spot.lat,
            lng: spot.lng
        };
        
        earth.add(marker);
    });
    
    console.log(`✅ 添加了 ${vegetationSpots.length} 个植被标记`);
}


// 创建动态云层效果（不依赖外部纹理）
function createDynamicClouds(scene) {
    // 创建云层几何体
    const cloudGeometry = new THREE.SphereGeometry(2.05, 48, 48);
    
    // 使用自定义着色器创建动态云层
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const fragmentShader = `
        varying vec2 vUv;
        uniform float time;
        
        // 简单噪声函数
        float noise(vec2 p) {
            return sin(p.x * 10.0) * sin(p.y * 6.0) * 0.5 + 0.5;
        }
        
        void main() {
            vec2 uv = vUv * 3.0;
            
            // 多层云层叠加
            float cloud1 = noise(uv + time * 0.1);
            float cloud2 = noise(uv * 1.5 - time * 0.05) * 0.7;
            float cloud3 = noise(uv * 2.0 + time * 0.03) * 0.5;
            
            float clouds = (cloud1 * 0.4 + cloud2 * 0.3 + cloud3 * 0.3);
            clouds = smoothstep(0.3, 0.7, clouds);
            
            // 边缘淡化
            float edge = 1.0 - smoothstep(0.45, 0.55, abs(vUv.y - 0.5));
            clouds *= edge * 0.35;
            
            gl_FragColor = vec4(1.0, 1.0, 1.0, clouds);
        }
    `;
    
    const cloudMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);
    
    return cloudMaterial; // 返回材质以便更新
}


// ===== 等待依赖加载完成 =====
if (typeof window.waitForEarthDependencies !== 'undefined') {
    console.log('⏳ 等待script.js信号...');
    window.waitForEarthDependencies(function() {
        console.log('🎯 收到script.js就绪信号,初始化地球');
        initEarth();
    });
} else {
    console.log('🔍 自主检查依赖...');
    function waitForDeps() {
        if (typeof THREE !== 'undefined' && typeof Reveal !== 'undefined') {
            console.log('✅ 依赖就绪，初始化地球');
            initEarth();
        } else {
            console.log('⏳ 等待依赖...');
            setTimeout(waitForDeps, 100);
        }
    }
    waitForDeps();
}

// Reveal幻灯片切换监听
if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', function(event) {
        const hasEarth = event.currentSlide.querySelector('#earth-canvas');
        if (hasEarth && !earthSystem) {
            console.log('🔍 切换到地球幻灯片，重新初始化');
            setTimeout(initEarth, 300);
        }
    });
}

console.log('🌍 Earth.js加载完成,等待初始化信号...');
