const { Model, DataTypes } = require("sequelize");

class User extends Model {
  static init(sequelize) { // ✅ initiate → init 변경
    return super.init({
      email: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
      },
      nick: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      profileImage: { // ✅ 프로필 이미지 컬럼 추가
        type: DataTypes.STRING,
        allowNull: true,
      },
      provider: {
        type: DataTypes.ENUM('local', 'kakao'),
        allowNull: false,
        defaultValue: 'local',
      },
      snsId: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'User',
      tableName: 'users',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
        // 다대다 관계 설정: User와 BooklumiTest가 중간 테이블을 통해 다대다 관계
        db.User.belongsToMany(db.BooklumiTest, {
          foreignKey: 'userId',
          through: 'user_booklumi_tests',
          as: 'BooklumiTests',
        });

    db.User.hasMany(db.Post, { foreignKey: 'userId', as: 'Posts' });

    db.User.belongsToMany(db.User, {
      foreignKey: 'followingId',
      as: 'Followers',
      through: 'Follow',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followings',
      through: 'Follow',
    });
    db.User.hasMany(db.Like, { foreignKey: "userId", as: "likes" });

  }
}

module.exports = User;
