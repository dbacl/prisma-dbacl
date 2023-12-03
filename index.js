//import { PrismaClient } from '@prisma/client'; 

modifyWhere = async function(uid, where) {
	// get all groups of user
	const groups = await prisma.group.findMany({  
		where: {
			uid: uid
		}
	});
	groups.push({
		gid: 1 // public group
	});
	groups = groups.map(g => g.id);

	//returns true if they have permissions to perform the action
	return {where: {AND: [
		where,
		{OR: [
			{userR: true, uid: {in: groups}},
			{groupR: true, gid: {in: groups}},
			{otherR: true},
		]}
	]}};
}

export async function findFirstOrThrow(table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.findFirstOrThrow(where);
}

export async function findUniqueOrThrow(table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.findUniqueOrThrow(where);
}

export async function findMany(table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.findMany(where);
}

export async function create(table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.create(where);
}

export async function update(table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.update(where);
}

const _delete = async function (table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.delete(where);
};
export { _delete as delete };

export async function deleteMany(table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.deleteMany(where);
}

export async function upsert(table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.upsert(where);
}



