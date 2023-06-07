import { Badge } from 'react-bootstrap'
import { REG_STATE_UNREGISTERED_VESSEL, REG_STATE_APP_FEE_PENDING, REG_STATE_REG_FEE_PENDING, REG_STATE_PENDING_REG_APPROVAL, USER_TYPE_NONE, SHIP_TYPE_NONE, SHIP_TYPE_PLEASURE_VESSEL, SHIP_TYPE_COMMERCIAL, ELIG_TYPE_NONE, ELIG_TYPE_NA, ELIG_TYPE_BDT, ELIG_TYPE_EEAC, ELIG_TYPE_BCP, ELIG_TYPE_EEIG, ELIG_TYPE_CWS, ELIG_TYPE_UKC, ELIG_TYPE_BDTC, ELIG_TYPE_BOC, ELIG_TYPE_CC, ELIG_TYPE_NK, ELIG_TYPE_CEU } from './constants'
import { REG_STATE_REG_APPROVED, REG_STATE_REG_REJECTED, REG_STATE_REG_COMPLETED } from './constants'
import { USER_TYPE_BROKER, USER_TYPE_COMMERCIAL, USER_TYPE_INDIVIDUAL, USER_TYPE_REGISTRAR } from './constants'
import { PROP_TYPE_NONE, PROP_TYPE_PRP, PROP_TYPE_PPJ, PROP_TYPE_PWH, PROP_TYPE_SAI, PROP_TYPE_VSC, PROP_TYPE_CTP } from './constants'
import { PORT_NONE, PORT_VCT, PORT_RBH, PORT_SBG, PORT_PNC, PORT_BAR, PORT_WHT } from './constants'
import { PLE_NONE, PLE_BAR, PLE_DIN, PLE_HVC, PLE_INF, PLE_MSA, PLE_MYT, PLE_NRB, PLE_SYT, PLE_SBT, PLE_WBK } from './constants'

export function accountBadge(userType) {
    var str = ''
    var variant = ''
    switch (userType) {
        case USER_TYPE_REGISTRAR:
            str = "Registrar"
            variant = "primary"
            break;
        case USER_TYPE_BROKER:
            str = "Broker"
            variant = "secondary"
            break;
        case USER_TYPE_INDIVIDUAL:
            str = "Personal"
            variant = "success"
            break;
        case USER_TYPE_COMMERCIAL:
            str = "Commercial"
            variant = "info"
            break;
        default:
            str = "Unknown User Type"
            variant = "warning"
            break;

    }

    return (
        <Badge className='Vessel-Badge' pill variant={variant}> {str}</Badge>
    )
}


export function checkEligType(port) {
    let str = ""
    switch (port) {
        case ELIG_TYPE_NONE:
            str = 'No Eligibility Type'
            break;
        case ELIG_TYPE_NA:
            str = 'Navis Album'
            break;
        case ELIG_TYPE_BDT:
            str = 'British Dependent Territories'
            break;
        case ELIG_TYPE_EEAC:
            str = 'EEA Country'
            break;
        case ELIG_TYPE_BCP:
            str = 'British Overseas Possession'
            break;
        case ELIG_TYPE_EEIG:
            str = 'EEIG'
            break;
        case ELIG_TYPE_CWS:
            str = 'Commonwealth State'
            break;
        default:
            str = 'Unknown Eligibility Type'
            break;
    }
    return str
}

export function checkPersonalEligType(port) {
    let str = ""
    switch (port) {
        case ELIG_TYPE_NONE:
            str = 'No Eligibility Type'
            break;
        case ELIG_TYPE_UKC:
            str = 'United Kingdom Citizen'
            break;
        case ELIG_TYPE_BDTC:
            str = 'British Dependent Territories Citizen'
            break;
        case ELIG_TYPE_BOC:
            str = 'British Overseas Citizen'
            break;
        case ELIG_TYPE_CC:
            str = 'Commonwealth Citizen'
            break;
        case ELIG_TYPE_NK:
            str = 'Non-UK settled in UK'
            break;
        case ELIG_TYPE_CEU:
            str = 'Citizen of EU Member State'
            break;
        default:
            str = 'Unknown Eligibility Type'
            break;
    }
    return str
}

export function checkUserType(port) {
    let str = ""
    switch (port) {
        case USER_TYPE_NONE:
            str = 'NO TYPE'
            break;
        case USER_TYPE_BROKER:
            str = 'Broker'
            break;
        case USER_TYPE_INDIVIDUAL:
            str = 'Personal'
            break;
        case USER_TYPE_COMMERCIAL:
            str = 'Commercial'
            break;
        case USER_TYPE_REGISTRAR:
            str = 'Registrar'
            break;
        default:
            str = 'Unknown User Type'
            break;
    }
    return str
}

export function checkShipType(port) {
    let str = ""
    switch (port) {
        case SHIP_TYPE_NONE:
            str = 'NO TYPE'
            break;
        case SHIP_TYPE_PLEASURE_VESSEL:
            str = 'Pleasure Vessel'
            break;
        case SHIP_TYPE_COMMERCIAL:
            str = 'Commercial Vessel'
            break;
        default:
            str = 'Unknown Ship Type'
            break;
    }
    return str
}

export function checkRegState(reg_status) {
    let str = ""
    switch (reg_status) {
        case REG_STATE_UNREGISTERED_VESSEL:
            str = 'Unregistered Vessel'
            break;
        case REG_STATE_APP_FEE_PENDING:
            str = 'Application Fee Pending'
            break;
        case REG_STATE_REG_FEE_PENDING:
            str = 'Registration Fee Pending'
            break;
        case REG_STATE_PENDING_REG_APPROVAL:
            str = 'Registration Approval Pending'
            break;
        case REG_STATE_REG_APPROVED:
            str = 'Registration Approved'
            break;
        case REG_STATE_REG_REJECTED:
            str = 'Registration Rejected'
            break;
        case REG_STATE_REG_COMPLETED:
            str = 'Registration Completed'
            break;
        default:
            str = 'Unknown Registration Status'
            break;
    }
    return str
}


export function checkPropType(prop_type) {
    let str = ""
    switch (prop_type) {
        case PROP_TYPE_NONE:
            str = 'No Propulsion Type'
            break;
        case PROP_TYPE_PRP:
            str = 'Propellor'
            break;
        case PROP_TYPE_PPJ:
            str = 'Pump Jet'
            break;
        case PROP_TYPE_PWH:
            str = 'Paddle Wheel'
            break;
        case PROP_TYPE_SAI:
            str = 'Sail'
            break;
        case PROP_TYPE_VSC:
            str = 'Voith-Schneider Cyclo-Rotor'
            break;
        case PROP_TYPE_CTP:
            str = 'Caterpillar'
            break;
        default:
            str = 'Unregistered Propulsion Type'
            break;
    }
    return str
}


export function checkPort(port) {
    let str = ""
    switch (port) {
        case PORT_NONE:
            str = 'No Port'
            break;
        case PORT_WHT:
            str = 'Whitby Harbour'
            break;
        case PORT_SBG:
            str = 'Scarborough'
            break;
        case PORT_PNC:
            str = 'Point Newcastle'
            break;
        case PORT_BAR:
            str = 'Barrow'
            break;
        case PORT_RBH:
            str = 'Robin Hood\'s Bay'
            break;
        case PORT_VCT:
            str = 'Victoria'
            break;
        default:
            str = 'Unregistered Port'
            break;
    }
    return str
}

export function checkVesselType(type) {
    let str = ""
    switch (type) {
        case PLE_NONE:
            str = 'No Vessel Type'
            break;
        case PLE_BAR:
            str = 'Barge'
            break;
        case PLE_DIN:
            str = 'Dinghy'
            break;
        case PLE_HVC:
            str = 'Hovercraft'
            break;
        case PLE_INF:
            str = 'Inflatable'
            break;
        case PLE_MSA:
            str = 'Motor Sailer'
            break;
        case PLE_MYT:
            str = 'Motor Yacht'
            break;
        case PLE_NRB:
            str = 'Narrow Boat'
            break;
        case PLE_SYT:
            str = 'Sailing Yacht'
            break;
        case PLE_SBT:
            str = 'Sports Boat'
            break;
        case PLE_WBK:
            str = 'Wet Bike'
            break;
        default:
            str = 'Unregistered Vessel Type'
            break;
    }
    return str
}