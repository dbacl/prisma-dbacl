//import { PrismaClient } from '@prisma/client'; 

create = async function(table, options={}) {
	return await table.create(options);
}

addUser = async function(userId) {
	return await prisma.groups.create({
		data: {
			uid: userId,
		},
		select: {
			gid: true,
		}
	}).gid;
}

modifyOptions = async function(uid, options) {
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
		{userR: true, uid: {in: groups}},
		{groupR: true, gid: {in: groups}},
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
	options = modifyOptions(uid, options);
	return await table.findFirstOrThrow(options);
}

findUniqueOrThrow = async function(table, uid, options={}) {
	options = modifyOptions(uid, options);
	return await table.findUniqueOrThrow(options);
}

update = async function(table, uid, options={}) {
	options = modifyOptions(uid, options);
	return await table.update(options);
}

_delete = async function (table, uid, options={}) {
	options = modifyOptions(uid, options);
	return await table.delete(options);
};

deleteMany = async function(table, uid, options={}) {
	options = modifyOptions(uid, options);
	return await table.deleteMany(options);
}

upsert = async function(table, uid, options={}) {
	options = modifyOptions(uid, options);
	return await table.upsert(options);
}

findMany = async function(table, uid, options={}) {
	options = modifyOptions(uid, options);
	return await table.findMany(options);
}

module.exports = {
	create, addUser, findFirstOrThrow, findUniqueOrThrow, update, _delete, deleteMany, upsert, findMany
}
