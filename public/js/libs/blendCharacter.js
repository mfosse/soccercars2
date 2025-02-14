THREE.BlendCharacter = function(assetHolder) {
	
	this.isLoading = false;

	this.animations = {};
	this.weightSchedule = [];
	this.warpSchedule = [];
	this.AH = assetHolder || null;

	this.load = function(url, onLoad) {
		var scope = this;
		
		var loader = new THREE.JSONLoader();
		loader.load(url, function(geometry, materials) {
			
			//var originalMaterial = materials[0];
			//scope.originalMaterial = originalMaterial;
			//originalMaterial.skinning = true;
			//THREE.SkinnedMesh.call(scope, geometry, originalMaterial);
			
			materials.forEach(function(material) {
				material.skinning = true;
			});
			THREE.SkinnedMesh.call(scope, geometry, new THREE.MeshFaceMaterial(materials));
			scope.mixer = new THREE.AnimationMixer(scope);
			
			for (var i = 0; i < geometry.animations.length; ++i) {
				scope.mixer.clipAction(geometry.animations[i]);
			}
			
			if (onLoad !== undefined) onLoad();
		});
	};


	this.loadFast = function(url, assetHolder) {
		if(this.isLoading) {
			return;
		} else {
			this.isLoading = true;
		}
		
		/*switch(url) {
			case "car":
				url = "assets/models/objects/vehicles/car.json";
			case "treeLeaves":
				url = "assets/models/enviroment/trees/animated-tree/final/treeLeaves.json";
				break;
			case "treeBark":
				url = "assets/models/enviroment/trees/animated-tree/final/treeBark.json";
				break;
		}*/
		
		var scope = this;
		
		var AH = this.AH || assetHolder;
		
		var model = AH.parseCachedModel(url);
		console.log("loading: " + url);
		var geometry = model.geometry ? model.geometry : model;
		var materials = model.materials;
		
		/*var originalMaterial = materials[0];
		scope.originalMaterial = originalMaterial;
		originalMaterial.skinning = true;
		THREE.SkinnedMesh.call(scope, geometry, originalMaterial);*/
		
		if(typeof(materials) !== "undefined") {

			materials.forEach(function(material) {
				material.skinning = true;
			});
			THREE.SkinnedMesh.call(scope, geometry, new THREE.MeshFaceMaterial(materials));
		
		}
		
		scope.mixer = new THREE.AnimationMixer(scope);
		
		//console.log(geometry);
		if(typeof(geometry.animation == "undefined")) {
			geometry.animations = [];
		}
		
		for (var i = 0; i < geometry.animations.length; ++i) {
			scope.mixer.clipAction(geometry.animations[i]);
		}
	};



	this.update = function(dt) {
		this.mixer.update(dt);
	};

	this.play = function(animName, weight) {
		//console.log("play('%s', %f)", animName, weight);
		//console.log(animName);
		return this.mixer.clipAction(animName).setEffectiveWeight(weight).play();
	};
	
	this.crossfade = function(fromAnimName, toAnimName, duration) {
		this.mixer.stopAllAction();
		var fromAction = this.play(fromAnimName, 1);
		var toAction = this.play(toAnimName, 1);
		fromAction.crossFadeTo(toAction, duration, false);
	};

	this.warp = function(fromAnimName, toAnimName, duration) {
		this.mixer.stopAllAction();
		var fromAction = this.play(fromAnimName, 1);
		var toAction = this.play(toAnimName, 1);
		fromAction.crossFadeTo(toAction, duration, true);
	};

	this.applyWeight = function(animName, weight) {
		this.mixer.clipAction(animName).setEffectiveWeight(weight);
	};

	this.getWeight = function(animName) {
		return this.mixer.clipAction(animName).getEffectiveWeight();
	};

	this.pauseAll = function() {
		this.mixer.timeScale = 0;
	};

	this.unPauseAll = function() {
		this.mixer.timeScale = 1;
	};
	
	this.stopAll = function() {
		this.mixer.stopAllAction();
	};
	
	this.showModel = function( boolean ) {
		this.visible = boolean;
	};
};


THREE.BlendCharacter.prototype = Object.create(THREE.SkinnedMesh.prototype);
THREE.BlendCharacter.prototype.constructor = THREE.BlendCharacter;

THREE.BlendCharacter.prototype.getForward = function() {
	var forward = new THREE.Vector3();
	return function() {
		// pull the character's forward basis vector out of the matrix
		forward.set(-this.matrix.elements[8], -this.matrix.elements[9], -this.matrix.elements[10]);
		return forward;
	}
};