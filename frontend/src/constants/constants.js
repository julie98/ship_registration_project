export const USER_TYPE_NONE = 0;
export const USER_TYPE_INDIVIDUAL = 1;
export const USER_TYPE_BROKER = 2;
export const USER_TYPE_COMMERCIAL = 3;
export const USER_TYPE_REGISTRAR = 4;


export const SHIP_TYPE_NONE = 0;
export const SHIP_TYPE_PLEASURE_VESSEL = 1;
export const SHIP_TYPE_COMMERCIAL = 2;

/**************************************************
 * Citizen Eligibility Types:
 *      HKC = United Kingdom Citizen
 *      BDTC = British Dependent Territories Citizen
 *      BOC = British Overseas Citizen
 *      CC = Commonwealth Citizen
 *      NK = Non-UK settled in UK
 *      CEU = Citizen of EU Member State
 *      NA = Navis Album
 *      BDT = British Dependent Territories
 *      EEAC = EEA Country
 *      BCP = British Overseas Possession
 *      EEIG = EEIG
 *      CWS = Commonwealth State
 **************************************************/

export const ELIG_TYPE_NONE = 0;
export const ELIG_TYPE_UKC = 1;
export const ELIG_TYPE_BDTC = 2;
export const ELIG_TYPE_BOC = 3;
export const ELIG_TYPE_CC = 4;
export const ELIG_TYPE_NK = 5;
export const ELIG_TYPE_CEU = 6;

export const ELIG_TYPE_NA = 1;
export const ELIG_TYPE_BDT = 2;
export const ELIG_TYPE_EEAC = 3;
export const ELIG_TYPE_BCP = 4;
export const ELIG_TYPE_EEIG = 5;
export const ELIG_TYPE_CWS = 6;


export const DECISION_NONE = "NONE";
export const DECISION_REJECTED = "rejected";
export const DECISION_APPROVED = "approved";

//axios error types

/**************************************************
 * Propulsion Method Types:
 *      PRP = Propellor
 *      PPJ = Pump Jet
 *      PWH = Paddle Wheel
 *      SAI = Sail
 *      VSC = Voith-Schneider Cyclo-Rotor
 *      CTP = Caterpillar
 **************************************************/

export const PROP_TYPE_NONE = 0;
export const PROP_TYPE_PRP = 1;
export const PROP_TYPE_PPJ = 2;
export const PROP_TYPE_PWH = 3;
export const PROP_TYPE_SAI = 4;
export const PROP_TYPE_VSC = 5;
export const PROP_TYPE_CTP = 6;

/**************************************************
* Ports:
*      WHT = Whitby Harbour
*      SBG = Scarborough
*      PNC = Point Newcastle
*      BAR = Barrow
*      RHB = Robin Hood's Bay
*      VCT = Victoria
**************************************************/

export const PORT_NONE = 0;
export const PORT_WHT = 1;
export const PORT_SBG = 2;
export const PORT_PNC = 3;
export const PORT_BAR = 4;
export const PORT_RBH = 5;
export const PORT_VCT = 6;

/**************************************************
* Pleasure Craft Types:
*      BAR = Barge
*      DIN = Dinghy
*      HVC = Hovercraft
*      INF = Inflatable
*      MSA = Motor Sailer
*      MYT = Motor Yacht
*      NRB = Narrow Boat
*      SYT = Sailing Yacht
*      SBT = Sports Boat
*      WBK = Wet Bike
**************************************************/

export const PLE_NONE = 0
export const PLE_BAR = 1
export const PLE_DIN = 2
export const PLE_HVC = 3
export const PLE_INF = 4
export const PLE_MSA = 5
export const PLE_MYT = 6
export const PLE_NRB = 7
export const PLE_SYT = 8
export const PLE_SBT = 9
export const PLE_WBK = 10

export const REG_STATE_UNREGISTERED_VESSEL = 'unregistered_vessel'
export const REG_STATE_APP_FEE_PENDING = 'app_fee_pending'
export const REG_STATE_REG_FEE_PENDING = 'reg_fee_pending'
export const REG_STATE_PENDING_REG_APPROVAL = 'pending_reg_approval'
export const REG_STATE_REG_APPROVED = 'reg_approved'
export const REG_STATE_REG_REJECTED = 'reg_rejected'
export const REG_STATE_REG_COMPLETED = 'reg_completed'

export const COMMERCIAL_TYPE_TANKER = 'Tanker'
export const TANKER_SIZE_NONE = ''
export const TANKER_SIZE_AFRAMAX = 'Aframax'
export const TANKER_SIZE_PANAMAX = 'Panamax'
export const TANKER_SIZE_SUEZMAX = 'Suezmax'
export const TANKER_SIZE_VLCC = 'Very Large Crude Carrier (VLCC)'
export const TANKER_SIZE_ULCC = 'Ultra Large Crude Carrier (ULCC)'



export const COMMERCIAL_SHIP_TYPE_LIST = {
    "Dry Cargo": {
        name: "Dry Cargo",
        results: [
            {
                title: "Handysize",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Handymax",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Supramax",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Panamax",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "New Panamax",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Capesize",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Very Large",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Seawaymax",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Kamsarmax",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Setouchmax",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Dunkirkmax",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Newcastlemax",
                description: "Bulk Carrier",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Feeder",
                description: "Container Ship",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Feedermax",
                description: "Container Ship",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Panamax",
                description: "Container Ship",
                vessel_type: "Dry Cargo"
            },
            {
                title: "New Panamax",
                description: "Container Ship",
                vessel_type: "Dry Cargo"
            },
            {
                title: "Ultra Large",
                description: "Container Ship",
                vessel_type: "Dry Cargo"
            }
        ]
    },
    "Tanker": {
        name: "Tanker",
        results: [
            {
                title: "Oil Tanker",
                description: "",
                vessel_type: "Tanker"
            },

            {
                title: "Chemical Tanker",
                description: "",
                vessel_type: "Tanker"
            },
            {
                title: "Liquified Natural Gas (LNG)",
                description: "",
                vessel_type: "Tanker"
            },
            {
                title: "Slurry Tanker",
                description: "",
                vessel_type: "Tanker"
            },
            {
                title: "Hydrogen Tanker",
                description: "",
                vessel_type: "Tanker"
            },
            {
                title: "Wine Tanker",
                description: "",
                vessel_type: "Tanker"
            },
            {
                title: "Juice Tanker",
                description: "",
                vessel_type: "Tanker"
            },
            {
                title: "Integrated Tug Barge (ITB)",
                description: "",
                vessel_type: "Tanker"
            }
        ]
    },
    "Passenger Ships": {
        name: "Passenger Ships",
        results: [
            {
                title: "Ocean Liner",
                description: "",
                vessel_type: "Passenger Ships"
            },
            {
                title: "Cruise Ship",
                description: "",
                vessel_type: "Passenger Ships"
            },
            {
                title: "Ferry",
                description: "",
                vessel_type: "Passenger Ships"
            },
            {
                title: "Yacht",
                description: "",
                vessel_type: "Passenger Ships"
            }
        ]
    },
    "Specialised Vessels": {
        name: "Specialised Vessels",
        results: [
            {
                title: "Tugboat",
                description: "",
                vessel_type: "Specialized Vessels"
            },
            {
                title: "Ice Breaking Vessel",
                description: "",
                vessel_type: "Specialized Vessels"
            },
            {
                title: "Cable Laying Vessel",
                description: "",
                vessel_type: "Specialized Vessels"
            },
            {
                title: "Well Testing Services Vessel",
                description: "",
                vessel_type: "Specialized Vessels"
            },
            {
                title: "Field Support Vessel",
                description: "",
                vessel_type: "Specialized Vessels"
            },
            {
                title: "Seismic Vessel",
                description: "",
                vessel_type: "Specialized Vessels"
            },
            {
                title: "Pipelaying Vessel",
                description: "",
                vessel_type: "Specialized Vessels"
            },
            {
                title: "Fire Fighting Vessels",
                description: "",
                vessel_type: "Specialized Vessels"
            }
        ]
    },
    "Offshore Vessels": {
        name: "Offshore Vessels",
        results: [
            {
                title: "Anchor Handling Tug Supply Vessel (AHTS)",
                description: "",
                vessel_type: "Offshore Vessels"
            },
            {
                title: "Construction Support Vessel (CSV)",
                description: "",
                vessel_type: "Offshore Vessels"
            },
            {
                title: "Well Intervention Vessel",
                description: "",
                vessel_type: "Offshore Vessels"
            },
            {
                title: "Crane Vessel",
                description: "",
                vessel_type: "Offshore Vessels"
            },
            {
                title: "Drilling Vessel",
                description: "",
                vessel_type: "Offshore Vessels"
            },
            {
                title: "Platform Supply Vessel (PSV)",
                description: "",
                vessel_type: "Offshore Vessels"
            },
            {
                title: "Offshore Barge",
                description: "",
                vessel_type: "Offshore Vessels"
            },
            {
                title: "Safety Standby Vessel (SSBV)",
                description: "",
                vessel_type: "Offshore Vessels"
            }
        ]
    }
};



export const SURVEYOR_LIST = {
    "Govenrment": {
      name: "Government Surveyor",
      results: [
        {
          title: "Kane Fisher",
          description: "3GA Marine Ltd",
          operation: "Government"
        },
        {
          title: "River Maggio",
          description: "3GA Marine Ltd",
          operation: "Government"
        }
      ]
    },
    "Cargo": {
      name: "Cargo Surveyor",
      results: [
        {
          title: "Chadd O'Kon",
          description: "Brighton Marine Surveys Ltd",
          operation: "Cargo"
        },
        {
          title: "Opal Block",
          description: "Richard Watson & Co Ltd",
          operation: "Cargo"
        },
        {
          title: "Mr. Hubert Howell",
          description: "3GA Marine Ltd",
          operation: "Cargo"
        }
      ]
    },
    "Classification": {
      name: "Classification",
      results: [
        {
          title: "Florian Kertzmann",
          description: "Qodesh Engineering & Marine Services",
          operation: "Classification"
        },
        {
          title: "Cassie Waters",
          description: "Orcades Marine Management Consultants Ltd",
          operation: "Classification"
        },
        {
          title: "Jermey Zboncak",
          description: "Richard Watson & Co Ltd",
          operation: "Classification"
        }
      ]
    },
    "Independent": {
      name: "Independent",
      results: [
        {
          title: "Emelie Terry V",
          description: "Orcades Marine Management Consultants Ltd",
          operation: "Independent"
        }
      ]
    },
    "Yatch & Small Craft": {
      name: "Yatch & Small Craft",
      results: [
        {
          title: "Remington Stark",
          description: "Wal-Zenith International Limited",
          operation: "Yatch & Small Craft"
        },
        {
          title: "Jamaal Reichel",
          description: "Marine Surveyors Cayman Ltd",
          operation: "Yatch & Small Craft"
        },
        {
          title: "Carissa Koelpin",
          description: "Wal-Zenith International Limited",
          operation: "Yatch & Small Craft"
        },
        {
          title: "Laurine Bashirian",
          description: "B & H Marine Consultants",
          operation: "Yatch & Small Craft"
        },
        {
          title: "Jessica Crona",
          description: "A R Brink and Associates",
          operation: "Yatch & Small Craft"
        },
        {
          title: "Mrs. Jodie Hettinger",
          description: "Brighton Marine Surveys Ltd",
          operation: "Yatch & Small Craft"
        }
      ]
    }
  };