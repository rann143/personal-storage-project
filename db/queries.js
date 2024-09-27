const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getUserById(id) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  } catch (err) {
    console.log(err);
  }
}

async function getUserByUsername(username) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    return user;
  } catch (err) {
    console.log(err);
  }
}

async function createUser(username, password) {
  try {
    await prisma.user.create({
      data: {
        username: username,
        password: password,
        isMember: true,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function createFolder(name, userId) {
  try {
    await prisma.folder.create({
      data: {
        name: name,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function getFolderByName(name) {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        name: name,
      },
    });
    return folder;
  } catch (err) {
    console.log(err);
  }
}

async function updateFolder(folderName, updateData) {
  const updateFolder = await prisma.folder.update({
    where: {
      name: folderName,
    },
    data: updateData,
  });
  return updateFolder;
}

// This will have to be updated once files can be uploaded. Due to relation,
// all files will need to be deleted first or moved to different folder before deletion
async function deleteFolder(folderName) {
  const deleteFolder = await prisma.folder.delete({
    where: {
      name: folderName,
    },
  });

  return deleteFolder;
}

async function getAllFoldersForUser(user) {
  try {
    const folders = await prisma.folder.findMany({
      where: {
        userId: user,
      },
    });
    return folders;
  } catch (err) {
    console.log(err);
  }
}

async function createFile(name, size, uploadTime, folderId) {
  try {
    await prisma.file.create({
      data: {
        name: name,
        size: size,
        uploadTime: uploadTime,
        folder: {
          connect: {
            id: folderId,
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  prisma,
  getUserById,
  getUserByUsername,
  createUser,
  createFolder,
  getFolderByName,
  getAllFoldersForUser,
  updateFolder,
  deleteFolder,
};
