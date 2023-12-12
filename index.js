var assert = require('assert');

gid = 2;

addGroup = function() {
	return gid++;
}

addUser = async function(userId) {
	await prisma.groups.create({
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
	const result = await prisma.groups.create({
		data: { uid: uid, gid: gid }
	});
	return result;
}

removeFromGroup = async function(uid, gid) {
	return await prisma.groups.delete({
		where: {
			uid: uid,
			gid: gid,
		}
	});
}

recurse = function(options, or) {
	if (Object.hasOwn(options, 'where')) {
		options['where'] = {AND: [options['where'], or]};
	} else {
		options['where'] = or;
	}
	if (Object.hasOwn(options, 'select')) {
		for (var key of Object.keys(options['select'])) {
			if (options['select'][key] === true) {
				// do nothing
				// assuming relations aren't selected with `true`
			} else {
				options['select'][key] = recurse(options['select'][key], or);
			}
		}
	}
	if (Object.hasOwn(options, 'include')) {
		for (var key of Object.keys(options['include'])) {
			if (options['include'][key] === true) {
				options['include'][key] = {where: or};
			} else {
				options['include'][key] = recurse(options['include'][key], or);
			}
		}
	}
	return options;
}

modifyOptions = async function(uid, options, write=false) {
	// get all groups of user
	let groups = await prisma.groups.findMany({  
		where: {
			uid: uid
		},
	});
	groups = groups.map(g => g.gid);
	
	// admin
	if (groups.includes(0)) {
		return options;
	}

	let or;
	if (write) {
		or = {OR: [
			{userW: true, owner: {in: groups}},
			{groupW: true, group: {in: groups}},
			{otherW: true},
		]}
	} else {
		or = {OR: [
			{userR: true, owner: {in: groups}},
			{groupR: true, group: {in: groups}},
			{otherR: true},
		]}
	}

	return recurse(options, or);
}

findUnique = async function(table, uid, options) {
	options = await modifyOptions(uid, options);
	return await table.findUnique(options);
}

findUniqueOrThrow = async function(table, uid, options) {
	options = await modifyOptions(uid, options);
	return await table.findUniqueOrThrow(options);
}

findFirst = async function(table, uid, options) {
	options = await modifyOptions(uid, options);
	return await table.findFirst(options);
}

findFirstOrThrow = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options);
	return await table.findFirstOrThrow(options);
}

findMany = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options);
	return await table.findMany(options);
}

// proper permissions need to be set by caller
create = async function(table, options={}) {
	return await table.create(options);
}

update = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options, true);
	return await table.update(options);
}

upsert = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options, true);
	return await table.upsert(options);
}

_delete = async function (table, uid, options={}) {
	options = await modifyOptions(uid, options, true);
	return await table.delete(options);
};

// proper permissions need to be set by caller
createMany = async function(table, options={}) {
	return await table.createMany(options);
}

updateMany = async function(table, options={}) {
	return await table.updateMany(options, true);
}

deleteMany = async function(table, uid, options={}) {
	options = await modifyOptions(uid, options, true);
	return await table.deleteMany(options);
}

module.exports = {
	create, addUser, 
	addGroup, addToGroup,
	findUnique, findUniqueOrThrow,
	findFirst, findFirstOrThrow,
	findMany,
	create, update, upsert, _delete, 
	createMany, updateMany, deleteMany, 
}
