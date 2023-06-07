
export function shortDate(date) {
    let newDate = new Date(date + "T00:00:00")
    return `${newDate.toLocaleString('default', { month: 'long' })} ${newDate.getDate()}, ${newDate.getFullYear()}`
    
}


export function longDate(date) {
    let newDate = new Date(date)
    return `${newDate.toLocaleString('default', { month: 'long' })} ${newDate.getDate()}, ${newDate.getFullYear()}`
    
}

export function shortDatePlusOneYear(date) {
    let newDate = new Date(date)
    return `${newDate.toLocaleString('default', { month: 'long' })} ${newDate.getDate() - 1}, ${newDate.getFullYear() + 1}`
}