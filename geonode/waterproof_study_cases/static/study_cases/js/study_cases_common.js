const delimitationFileEnum = {
  GEOJSON: 'geojson',
  SHP: 'shapefile'
}

const interpolationType = {
  LINEAR: 'LINEAR',
  POTENTIAL: 'POTENTIAL',
  EXPONENTIAL: 'EXPONENTIAL',
  LOGISTICS: 'LOGISTICS'
}

const defaultStepBioparams = "0.000001";
const defaultMinValBioparams = parseFloat(defaultStepBioparams);
const bioparamValidations = {
  "lucode": {"min": 0, "step": 1},
  "root_depth": {"min": 0},
  "load_n": {"min": 0},
  "load_p": {"min": 0},
  "crit_len_n": {"min": 0},
  "crit_len_p": {"min": 0},
  "usle_c": {"max": 1, "min": defaultMinValBioparams},
  "usle_p": {"max": 1, "min": defaultMinValBioparams},
  "eff_n": {"max": 1, "min": defaultMinValBioparams},
  "proportion_subsurface_n": {"max": 1, "min": defaultMinValBioparams},
  "cn_a": {"max": 100, "min": defaultMinValBioparams},
  "cn_b": {"max": 100, "min": defaultMinValBioparams},
  "cn_c": {"max": 100, "min": defaultMinValBioparams},
  "cn_d": {"max": 100, "min": defaultMinValBioparams},
  "kc_1": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_2": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_3": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_4": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_5": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_6": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_7": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_8": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_9": {"max": 1.5, "min": defaultMinValBioparams}, 
  "kc_10": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_11": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_12": {"max": 1.5, "min": defaultMinValBioparams},
  "sed_exp": {"max": 1, "min": defaultMinValBioparams},
  "sed_ret": {"max": 1, "min": defaultMinValBioparams},
  "cover_rank": {"max": 1, "min": defaultMinValBioparams},
  "p_ret": {"max": 1, "min": defaultMinValBioparams}, 
  "n_ret": {"max": 1, "min": defaultMinValBioparams},
  "native_veg": {"max": 1, "min": 0, "step": 1},
  "lulc_veg": {"max": 1, "min": 0, "step": 1},
};

const costVars = ['Q', 'CSed', 'CN', 'CP', 'WSed', 'WN', 'WP', 'WSedRet', 'WNRet', 'WPRet'];

