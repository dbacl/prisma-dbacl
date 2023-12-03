//import { PrismaClient } from '@prisma/client'; 
dbacl = {};

modifyWhere = async function(uid, options) {
	// get all groups of user
	const groups = await prisma.user.findMany({  
		where: {
			uid: uid
		},
		select: {
			groups: true
		}
	});
	groups.push({
		gid: 1 // public group
	});
	groups = groups.map(g => g.id);

	//returns true if they have permissions to perform the action
	options['where'] = {AND: [
		options['where'],
		{OR: [
			{userR: true, uid: {in: groups}},
			{groupR: true, gid: {in: groups}},
			{otherR: true},
		]}
	]};

	return options;
}

dbacl.findFirstOrThrow = async function(table, uid, options) {
	options = modifyWhere(uid, where);
	return await table.findFirstOrThrow(options);
}

dbacl.findUniqueOrThrow = async function(table, uid, options) {
	options = modifyWhere(uid, where);
	return await table.findUniqueOrThrow(options);
}


dbacl.update = async function(table, uid, options) {
	options = modifyWhere(uid, where);
	return await table.update(options);
}

dbacl._delete = async function (table, uid, options) {
	options = modifyWhere(uid, where);
	return await table.delete(options);
};

dbacl.deleteMany = async function(table, uid, options) {
	options = modifyWhere(uid, where);
	return await table.deleteMany(options);
}

dbacl.upsert = async function(table, uid, options) {
	options = modifyWhere(uid, where);
	return await table.upsert(options);
}



dbacl.findMany = async function(table, uid, options) {
	options = modifyWhere(uid, options);
	return await table.findMany(options);
}

dbacl.create = async function(table, uid, options) {
	options = modifyWhere(uid, where);
	return await table.create(options);
}


export { dbacl }
