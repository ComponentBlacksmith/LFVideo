import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { VRM, VRMHumanBoneName } from "@pixiv/three-vrm";

// Mixamo rig bone → VRM humanoid bone. Mixamo exports a fixed `mixamorig*`
// skeleton; this maps each of its bones onto the normalized VRM humanoid rig so
// a Mixamo FBX clip can drive any VRM. Fingers are intentionally omitted — most
// Mixamo clips lack finger detail and VRM finger naming is noisier.
const MIXAMO_TO_VRM: Record<string, VRMHumanBoneName> = {
  mixamorigHips: VRMHumanBoneName.Hips,
  mixamorigSpine: VRMHumanBoneName.Spine,
  mixamorigSpine1: VRMHumanBoneName.Chest,
  mixamorigSpine2: VRMHumanBoneName.UpperChest,
  mixamorigNeck: VRMHumanBoneName.Neck,
  mixamorigHead: VRMHumanBoneName.Head,
  mixamorigLeftShoulder: VRMHumanBoneName.LeftShoulder,
  mixamorigLeftArm: VRMHumanBoneName.LeftUpperArm,
  mixamorigLeftForeArm: VRMHumanBoneName.LeftLowerArm,
  mixamorigLeftHand: VRMHumanBoneName.LeftHand,
  mixamorigRightShoulder: VRMHumanBoneName.RightShoulder,
  mixamorigRightArm: VRMHumanBoneName.RightUpperArm,
  mixamorigRightForeArm: VRMHumanBoneName.RightLowerArm,
  mixamorigRightHand: VRMHumanBoneName.RightHand,
  mixamorigLeftUpLeg: VRMHumanBoneName.LeftUpperLeg,
  mixamorigLeftLeg: VRMHumanBoneName.LeftLowerLeg,
  mixamorigLeftFoot: VRMHumanBoneName.LeftFoot,
  mixamorigLeftToeBase: VRMHumanBoneName.LeftToes,
  mixamorigRightUpLeg: VRMHumanBoneName.RightUpperLeg,
  mixamorigRightLeg: VRMHumanBoneName.RightLowerLeg,
  mixamorigRightFoot: VRMHumanBoneName.RightFoot,
  mixamorigRightToeBase: VRMHumanBoneName.RightToes,
};

/**
 * Load a Mixamo FBX animation and retarget it onto `vrm`, returning a
 * THREE.AnimationClip whose tracks address the VRM's normalized humanoid bone
 * nodes (so it can be played with an AnimationMixer on `vrm.scene`).
 *
 * Adapted from the official @pixiv/three-vrm Mixamo example: it rebases each
 * Mixamo bone rotation into the VRM rest pose, scales the hips translation by
 * the height ratio, and flips axes for VRM0 models.
 */
export async function loadMixamoAnimation(
  url: string,
  vrm: VRM
): Promise<THREE.AnimationClip> {
  const loader = new FBXLoader();
  const asset = await loader.loadAsync(url);

  const clip =
    THREE.AnimationClip.findByName(asset.animations, "mixamo.com") ??
    asset.animations[0];

  const tracks: THREE.KeyframeTrack[] = [];

  const restRotationInverse = new THREE.Quaternion();
  const parentRestWorldRotation = new THREE.Quaternion();
  const _quatA = new THREE.Quaternion();
  const _vec3 = new THREE.Vector3();

  // Scale the hips translation by the VRM/Mixamo height ratio so the body
  // doesn't shoot up or sink into the floor.
  const motionHips = asset.getObjectByName("mixamorigHips");
  const motionHipsHeight = motionHips ? motionHips.position.y : 1;
  const vrmHips = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips);
  const vrmHipsY = vrmHips ? vrmHips.getWorldPosition(_vec3).y : 0;
  const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
  const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
  const hipsPositionScale =
    motionHipsHeight !== 0 ? vrmHipsHeight / motionHipsHeight : 1;

  const isVRM0 = vrm.meta?.metaVersion === "0";

  for (const track of clip.tracks) {
    const [mixamoRigName, propertyName] = track.name.split(".");
    const vrmBoneName = MIXAMO_TO_VRM[mixamoRigName];
    if (!vrmBoneName) continue;

    const vrmNode = vrm.humanoid.getNormalizedBoneNode(vrmBoneName);
    const mixamoRigNode = asset.getObjectByName(mixamoRigName);
    if (!vrmNode || !mixamoRigNode || !mixamoRigNode.parent) continue;

    const vrmNodeName = vrmNode.name;

    mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
    mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation);

    if (track instanceof THREE.QuaternionKeyframeTrack) {
      const values = track.values.slice();
      for (let i = 0; i < values.length; i += 4) {
        _quatA.fromArray(values, i);
        _quatA
          .premultiply(parentRestWorldRotation)
          .multiply(restRotationInverse);
        _quatA.toArray(values, i);
        if (isVRM0) {
          // Mirror X/Z for VRM0 (which faces -Z before rotateVRM0).
          values[i] = -values[i];
          values[i + 2] = -values[i + 2];
        }
      }
      tracks.push(
        new THREE.QuaternionKeyframeTrack(
          `${vrmNodeName}.${propertyName}`,
          track.times.slice(),
          values
        )
      );
    } else if (track instanceof THREE.VectorKeyframeTrack) {
      const values = track.values.map(
        (v, i) => (isVRM0 && i % 3 !== 1 ? -v : v) * hipsPositionScale
      );
      tracks.push(
        new THREE.VectorKeyframeTrack(
          `${vrmNodeName}.${propertyName}`,
          track.times.slice(),
          values
        )
      );
    }
  }

  return new THREE.AnimationClip("vrmMixamo", clip.duration, tracks);
}
