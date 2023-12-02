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

	return {where: {AND: [
		where,
		{OR: [
			{userR: true, uid: {in: groups}},
			{groupR: true, gid: {in: groups}},
			{otherR: true},
		]}
	]}};
}

exports.findFirstOrThrow = async function(table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.findFirstOrThrow(where);
}

exports.findMany = async function(table, uid, where) {
	where = modifyWhere(uid, where['where']);
	return await table.findMany(where);
}

exports.create = async function(table, uid, where) {
}
