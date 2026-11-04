
import {AudioSource, engine, Entity, MeshRenderer, Transform, TriggerArea, triggerAreaEventsSystem, Material} from '@dcl/sdk/ecs'
import {Vector3, Color4} from '@dcl/sdk/math'
import { TpVideoRoom } from './components/tpVideoRoom'
import { movePlayerTo } from '~system/RestrictedActions'


export class GameManager{

    //this string will control all the transitions and progression
    missionState: string = "introPlaying"

    //mission title (macro scale)
    //this shows up in the main title of the UI display
    missionTitle: string = ""

    tpVideoRoom: TpVideoRoom
    //tpVideoRoom2!: TpVideoRoom
    
    backgroundMusicEntity?: Entity

	constructor(){

        //init mission state and display title
        this.missionState = "introPlaying"
        this.missionTitle = "EXPLORE THE TOWN"
        
        //create the video room and set the intro video
		this.tpVideoRoom = new TpVideoRoom(this, "models/final/tpVideoRoomB.gltf", "models/final/tpVideoScreenB_noTex.gltf", 5)
        this.tpVideoRoom.setVideo("videos/spaceA.mp4", 3, 3)

    }

    foundTree(){
        this.missionState = 'ritualCutscenePlaying'
        //movePlayerTo({newRelativePosition: Vector3.create(10,2,10), cameraTarget: Vector3.create(10,2,10)})
        //this.tpVideoRoom.setVideo("videos/ritual.mp4", 3, 3)

        //create the video room and set the intro video
		/* this.tpVideoRoom2 = new TpVideoRoom(this, "models/final/tpVideoRoomB.gltf", "models/final/tpVideoScreenB_noTex.gltf", 5)
        this.tpVideoRoom2.setVideo("videos/ritual.mp4", 3, 3) */

        this.missionTitle = '@GhostTownDCL on X'
       
        movePlayerTo({
            newRelativePosition: Vector3.create(23.2,20,-21.75),
            cameraTarget: Vector3.create(17.43,20,-21.72)
        })

    }

    videoComplete(){

        console.log('GameManager: video playback complete')

        //this.startBackgroundMusic('sounds/bg/dysto.mp3', 0.4, true)

        // Handle video completion based on missionState

        //when intro cutscene is complete..
        if(this.missionState == "introPlaying"){

            //change the mission state to after intro
            this.missionState = "afterIntro"

            //move the player to the player's house starting point
            movePlayerTo({
                //-34,50,52 (temple landing)
                newRelativePosition: Vector3.create(20,2,20),//37.5,21,-19 (player's house position)
                cameraTarget: Vector3.create(0,15,0)
            })

        }
        else if(this.missionState == "afterIntro"){
            console.log('GameManager: ritual cutscene complete')
            //handle end of the ritual cutscene
            //move the player to the player's house starting point
            movePlayerTo({
                //-34,50,52 (temple landing)
                newRelativePosition: Vector3.create(-20,2,-20),//37.5,21,-19 (player's house position)
                cameraTarget: Vector3.create(0,15,0)
            })
        }
        else if(this.missionState == "afterTwoVideos"){
            //handle the end of the game
        }   
    }

    // Create a red cylinder at (20, 0, 20), radius 2m, resting on ground
	createRedCylinderMarker() {
		const height = 2
		const entity = engine.addEntity()
		Transform.create(entity, {
			position: Vector3.create(20, height / 2, 20),
			scale: Vector3.create(4, height, 4) // diameter 4 => radius 2
		})
		MeshRenderer.setCylinder(entity)
		Material.setPbrMaterial(entity, { albedoColor: Color4.Red() })
	}
    
    // Create a blue cylinder at (-20, 0, -20), radius 2m, resting on ground
    createBlueCylinderMarker() {
        const height = 2
        const entity = engine.addEntity()
        Transform.create(entity, {
            position: Vector3.create(-20, height / 2, -20),
            scale: Vector3.create(4, height, 4) // diameter 4 => radius 2
        })
        MeshRenderer.setCylinder(entity)
        Material.setPbrMaterial(entity, { albedoColor: Color4.Blue() })
    }

    // Create two trigger zones: Yellow at (-20, 0, 20) and Green at (20, 0, -20)
    createTriggerZones() {
        // Optional visual markers for the zones
        this.createColoredMarker(Vector3.create(-20, 1, 20), Color4.Yellow())
        this.createColoredMarker(Vector3.create(20, 1, -20), Color4.Green())

        // Yellow zone trigger (box 4x2x4 centered at y=1)
        const yellowZone = engine.addEntity()
		Transform.create(yellowZone, { position: Vector3.create(-20, 1, 20) })
		TriggerArea.setBox(yellowZone)
		triggerAreaEventsSystem.onTriggerEnter(yellowZone, () => this.yellowZoneTriggered())

        // Green zone trigger (box 4x2x4 centered at y=1)
        const greenZone = engine.addEntity()
        Transform.create(greenZone, { position: Vector3.create(20, 1, -20) })
        TriggerArea.setBox(greenZone)
		triggerAreaEventsSystem.onTriggerEnter(greenZone, () => this.GreenZoneTriggered())
    }

    // Handlers
    yellowZoneTriggered() {
        console.log('yellowZoneTriggered')
        // TODO: add your logic
    }
    GreenZoneTriggered() {
        console.log('GreenZoneTriggered')
        // TODO: add your logic
    }

    // Helper to make a visible cylinder marker with given color (radius 2, height 2)
    private createColoredMarker(pos: Vector3, color: Color4) {
        const height = 2
        const marker = engine.addEntity()
        Transform.create(marker, { position: pos, scale: Vector3.create(4, height, 4) })
        MeshRenderer.setCylinder(marker)
        Material.setPbrMaterial(marker, { albedoColor: color })
    }

    startBackgroundMusic(musicPath: string, volume: number = 0.5, loop: boolean = true) {
        // Stop existing music if playing
        if (this.backgroundMusicEntity) {
            this.stopBackgroundMusic()
        }
        
        // Create new music entity
        this.backgroundMusicEntity = engine.addEntity()
        
        // Parent to player so it always follows
        Transform.create(this.backgroundMusicEntity, {
            parent: engine.PlayerEntity,
            position: Vector3.create(0, 0, 0)  // Relative to player (at their position)
        })
        
        AudioSource.create(this.backgroundMusicEntity, {
            audioClipUrl: musicPath,
            loop: loop,
            playing: true,
            volume: volume
        })
    }
    
    pauseBackgroundMusic() {
        if (this.backgroundMusicEntity && AudioSource.has(this.backgroundMusicEntity)) {
            const audioSource = AudioSource.getMutable(this.backgroundMusicEntity)
            audioSource.playing = false
        }
    }
    
    resumeBackgroundMusic() {
        if (this.backgroundMusicEntity && AudioSource.has(this.backgroundMusicEntity)) {
            const audioSource = AudioSource.getMutable(this.backgroundMusicEntity)
            audioSource.playing = true
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusicEntity) {
            AudioSource.deleteFrom(this.backgroundMusicEntity)
            engine.removeEntity(this.backgroundMusicEntity)
            this.backgroundMusicEntity = undefined
        }
    }

    
}