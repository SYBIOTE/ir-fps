import {
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { mergeBufferGeometries } from '@ir-engine/spatial/src/common/classes/BufferGeometryUtils'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { addObjectToGroup, removeGroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { useEffect } from 'react'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

export const ProjectileWeaponComponent = defineComponent({
  name: 'ProjectileWeaponComponent',
  jsonID: 'EE_FPS_projectileWeapon',

  schema: S.Object({
    weaponModel: S.String(''),
    reloadTime: S.Number(1),
    clipSize: S.Number(10),
    currentAmmo: S.Number(10),
    fireRate: S.Number(0.1),
    damage: S.Number(10),
    range: S.Number(100),
    spread: S.Number(0.01),
    bullet: S.Object({
      //the bullet itself could be a component, with modifiable params
      bulletModel: S.String(''),
      bulletSpeed: S.Number(100),
      bulletSize: S.Number(0.1),
      bulletColor: S.String('#ff0000'),
      bulletLifetime: S.Number(2),
      bulletDecay: S.Number(0.1),
      bulletDecayRate: S.Number(0.1),
      bulletDecayColor: S.String('#ff0000'), // for debug
      bulletDecaySize: S.Number(0.1),
      bulletDecayLifetime: S.Number(2)
    })
  }),
  shoot: (playerEntity, weaponEntity) => {
    const physicsWorld = Physics.getWorld(playerEntity)
    const currentWeaponEntity = useEntityContext()
    if (weaponEntity !== currentWeaponEntity) return
    if (!physicsWorld) return
    const weaponParams = getComponent(weaponEntity, ProjectileWeaponComponent)
    if (weaponParams.currentAmmo <= 0) {
      console.log('Out of ammo! Reload required.')
      return
    }
    // create a bullet entity
    // projectile shoot the bullet entity

    getMutableComponent(weaponEntity, ProjectileWeaponComponent).currentAmmo.set((value) => value - 1)

    if (weaponParams.currentAmmo <= 0) {
      ProjectileWeaponComponent.reload(weaponEntity)
    }
  },
  reload: (weaponEntity) => {},
  reactor: () => {
    const entity = useEntityContext()
    const weapon = useComponent(entity, ProjectileWeaponComponent)
    useEffect(() => {
      if (weapon.weaponModel.value === '') {
        console.warn('Weapon Model is not defined , using Default')
        const geometry = mergeBufferGeometries([
          new BoxGeometry(0.05, 0.05, 0.25),
          new BoxGeometry(0.025, 0.125, 0.025).translate(0, -0.125 * 0.5, 0.125)
        ])!.translate(0, 0, 0.125)
        const weaponModel = new Mesh(geometry, new MeshBasicMaterial({ color: 'grey' }))
        setComponent(entity, MeshComponent, weaponModel)
        addObjectToGroup(entity, weaponModel)
      } else {
        console.log('Weapon Model is defined')
        // load the appropiate weapon model
      }

      return () => {
        removeGroupComponent(entity)
      }
    }, [])

    return null
  }
})
