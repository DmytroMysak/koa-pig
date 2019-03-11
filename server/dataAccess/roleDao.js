export default class RoleDao {
  constructor(models) {
    this.roles = models.roles;
    this.usersRoles = models.usersRoles;
  }

  isRolesExist() {
    return this.roles.count()
      .then(rolesCount => !!rolesCount);
  }

  createInitRoles() {
    return this.roles.bulkCreate([{ name: 'admin' }, { name: 'user' }]);
  }

  getRoleIdByName(roleName) {
    return this.roles.findOne({
      where: { name: roleName },
      attribure: ['id'],
      raw: true,
    })
      .then(role => role ? role.id : null);
  }
}
