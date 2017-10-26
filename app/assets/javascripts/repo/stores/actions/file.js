import flash from '../../../flash';
import service from '../../services';
import * as types from '../mutation_types';
import { createTemp } from '../utils';

export const closeFile = ({ commit }, file) => {
  if (file.changed || file.tempFile) return;

  commit(types.TOGGLE_FILE_OPEN, file);
  commit(types.SET_FILE_ACTIVE, { file, active: false });
};

export const setFileActive = ({ commit, state, getters }, file) => {
  const currentActiveFile = getters.activeFile;

  if (currentActiveFile) {
    commit(types.SET_FILE_ACTIVE, { file: currentActiveFile, active: false });
  }

  commit(types.SET_FILE_ACTIVE, { file, active: true });
};

export const getFileData = ({ commit, dispatch }, file) => {
  commit(types.TOGGLE_LOADING, file);

  service.getFileData(file.url)
    .then(res => res.json())
    .then((data) => {
      commit(types.SET_FILE_DATA, { data, file });
      commit(types.SET_PREVIEW_MODE);
      commit(types.TOGGLE_FILE_OPEN, file);
      dispatch('setFileActive', file);
      commit(types.TOGGLE_LOADING, file);
    })
    .catch(() => {
      commit(types.TOGGLE_LOADING, file);
      flash('Error loading file data. Please try again.');
    });
};

export const getRawFileData = ({ commit, dispatch }, file) => service.getRawFileData(file)
  .then((raw) => {
    commit(types.SET_FILE_RAW_DATA, { file, raw });
  })
  .catch(() => flash('Error loading file content. Please try again.'));

export const changeFileContent = ({ commit }, { file, content }) => {
  commit(types.UPDATE_FILE_CONTENT, { file, content });
};

export const createTempFile = ({ state, commit, dispatch }, { tree, name }) => {
  const file = createTemp({
    name: name.replace(`${state.path}/`, ''),
    path: tree.path,
    type: 'blob',
    level: tree.level !== undefined ? tree.level + 1 : 0,
    changed: true,
  });

  commit(types.CREATE_TMP_FILE, {
    parent: tree,
    file,
  });
  commit(types.TOGGLE_FILE_OPEN, file);
  dispatch('setFileActive', file);
  dispatch('toggleEditMode', true);
};
