//import { PrismaClient } from '@prisma/client'; 
var assert = require('assert');

gid = 2;

addGroup = function() {
	return gid++;
}

create = async function(table, options={}) {
	return await table.create(options);
}

addUser = async function(userId) {
	return await prisma.groups.create({
		data: {
			uid: userId,
			gid: addGroup(),
			upg: true,
		},
		select: {
			gid: true,
		}
	}).gid;
}

addToGroup = async function(uid, gid) {
	assert(gid != 0)
	return await prisma.groups.create({
		data: { uid: uid, gid: gid }
	});
}

addAdmin = async function(uid) {
	return await prisma.groups.create({
		data: { uid: uid, gid: 0 }
	});
}

modifyOptions = async function(uid, options) {
	if (uid === 1) {
		return options;
	}
	// get all groups of user
	let groups = await prisma.groups.findMany({  
		where: {
			uid: uid
		},
	});
	groups.push({
		gid: 1 // public group
	});
	groups = groups.map(g => g.gid);

	or = {OR: [
		{userR: true, owner: {in: groups}},
		{groupR: true, group: {in: groups}},
		{otherR: true},
	]}

	// returns true if they have permissions to perform the action
	// if (options['where'] == undefined) {
	// 	options['where'] = or;
	// } else {
		options['where'] = {AND: [options['where'], or]};
	// }

	return options;
}

findFirstOrThrow = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options);
	return await table.findFirstOrThrow(options);
}

findUniqueOrThrow = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options);
	return await table.findUniqueOrThrow(options);
}

update = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options);
	return await table.update(options);
}

_delete = async function (table, uid, options={}) {
	options = await modifyOptions(uid, options);
	return await table.delete(options);
};

deleteMany = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options);
	return await table.deleteMany(options);
}

upsert = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options);
	return await table.upsert(options);
}

findMany = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options);
	return await table.findMany(options);
}

module.exports = {
	create, addUser, findFirstOrThrow, findUniqueOrThrow, update, _delete, deleteMany, upsert, findMany, addGroup, addToGroup
}
