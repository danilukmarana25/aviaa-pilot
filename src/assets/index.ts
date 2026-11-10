/**
 * Fixed Codex asset contract. Only these names exist — never invent another one.
 */
export const assets = {
  bgGame: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  sprite1: require('../../assets/sprite_1.png'), // plane, facing RIGHT
  sprite2: require('../../assets/sprite_2.png'), // route stamp medallion
  sprite3: require('../../assets/sprite_3.png'), // turbulence gust
  sprite4: require('../../assets/sprite_4.png'), // precision landing ring
  sprite5: require('../../assets/sprite_5.png'), // rank badge
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
};

export const SPRITE_BY_INDEX = [
  assets.sprite1,
  assets.sprite2,
  assets.sprite3,
  assets.sprite4,
  assets.sprite5,
];

export default assets;
