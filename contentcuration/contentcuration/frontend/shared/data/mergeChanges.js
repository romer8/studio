/*
 * Code in this file is modified from:
 * https://github.com/dfahlander/Dexie.js/blob/master/samples/remote-sync/websocket/WebSocketSyncServer.js
 * This is a copy of the NOTICE from the repository, as required by the Apache v2 license
 * Dexie.js
 * 
 * Copyright (c) 2014-2017 David Fahlander
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Dexie from 'dexie';
import { CHANGE_TYPES } from './constants';


function applyModifications(obj, modifications) {
    Object.keys(modifications).forEach(function (keyPath) {
        Dexie.setByKeyPath(obj, keyPath, modifications[keyPath]);
    });
    return obj;
}

function combineCreateAndUpdate(oldChange, newChange) {
  // Apply modifications to existing object.
  // Passed in object should be modifiable, so no need to clone.
  applyModifications(oldChange.obj, newChange.mods);
  return oldChange;
}

function combineUpdateAndUpdate(oldChange, newChange) {
    Object.keys(newChange.mods).forEach(keyPath => {
        // If oldChange was changing a parent path of this keyPath
        // we must update the parent path rather than adding this keyPath
        let hadParentPath = false;
        Object.keys(oldChange.mods).filter(parentPath => keyPath.indexOf(parentPath + '.') === 0)
          .forEach(parentPath => {
            Dexie.setByKeyPath(
              oldChange.mods[parentPath],
              keyPath.substr(parentPath.length + 1),
              newChange.mods[keyPath]
            );
            hadParentPath = true;
        });
        if (!hadParentPath) {
            // Add or replace this keyPath and its new value
            oldChange.mods[keyPath] = newChange.mods[keyPath];
        }
        // In case oldChange contained sub-paths to the new keyPath,
        // we must make sure that those sub-paths are removed since
        // we must mimic what would happen if applying the two changes after each other:
        Object.keys(oldChange.mods).filter(subPath => subPath.indexOf(keyPath + '.') === 0)
          .forEach(subPath => {
            delete oldChange.mods[subPath];
          });
    });
    return oldChange;
}


/*
 * Function to merge changes for the same object from Dexie.js
 */
export default function mergeChanges(oldChange, newChange) {
  switch (oldChange.type) {
      case CHANGE_TYPES.CREATED:
          switch (newChange.type) {
              case CHANGE_TYPES.CREATED:
                // Another CHANGE_TYPES.CREATED replaces previous CHANGE_TYPES.CREATED.
                return newChange;
              case CHANGE_TYPES.UPDATED:
                // Apply newChange.mods into oldChange.obj
                return combineCreateAndUpdate(oldChange, newChange);
              case CHANGE_TYPES.DELETED:
                // Object created and then deleted.
                // return null to indicate the change should be deleted.
                return null;
          }
          break;
      case CHANGE_TYPES.UPDATED:
          switch (newChange.type) {
              case CHANGE_TYPES.CREATED:
                // Another CHANGE_TYPES.CREATED replaces previous update.
                return newChange;
              case CHANGE_TYPES.UPDATED:
                // Add the additional modifications to existing modification set.
                return combineUpdateAndUpdate(oldChange, newChange);
              case CHANGE_TYPES.DELETED:
                // Only send the delete change. What was updated earlier is no longer of interest.
                return newChange;
          }
          break;
      case CHANGE_TYPES.DELETED:
          switch (newChange.type) {
              case CHANGE_TYPES.CREATED:
                // A resurection occurred. Only create change is of interest.
                return newChange;
              case CHANGE_TYPES.UPDATED:
                // Nothing to do. We cannot update an object that doesnt exist.
                // Leave the delete change there.
                // we could potentially resurrect the object here?
                return oldChange;
              case CHANGE_TYPES.DELETED:
                // Still a delete change. Leave as is.
                return oldChange;
          }
          break;
  }
}
