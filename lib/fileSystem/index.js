
const { fs: memfs, Volume, createFsFromVolume } = require('memfs');
const { ufs } = require('unionfs');
const diskFs = require('fs');

const fs = ufs.use(diskFs).use(memfs);
const systemFs = createFsFromVolume(new Volume());
module.exports = {
  fs,
  Volume,
  systemFs,
  memfs,
};
