const { Model, DataTypes } = require("sequelize");

module.exports = class Hashtag extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: { // ✅ title → name 변경
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Hashtag",
        tableName: "hashtags", // ✅ 테이블명 소문자로 변경 (일반적으로 소문자 사용)
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" }); // ✅ 오타 수정
  }
};
