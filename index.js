function update(textarea) {
    let string = textarea.value.toLowerCase();
    let result = document.getElementById("result");

    try {
        let satisfiable = dnfSat(string);
        result.innerText = `satisfiable: ${satisfiable}`;
    } catch (err) {
        result.innerText = err.message;
    }
}

function dnfSat(string) {
    let termDict = {};
    let satisfiable = true;
    let anyTermSatisfiable = false;
    let negated = false;
    let conjunctiveConnection = false;
    let disjunctiveConnection = false;

    if(string.match(/^ *$/)) {
        throw Error("invalid dnf");
    }

    for (let c of string) {
        if (c === " ") {
            continue;
        }

        if (c === "*") {
            if (negated) {
                throw Error("invalid dnf \n(expected variable after '-')")
            }
            if (conjunctiveConnection) {
                throw Error("invalid dnf \n(expected variable between '*')");
            }
            if (disjunctiveConnection) {
                throw Error("invalid dnf \n(expected variable between '+' and '*')");
            }

            conjunctiveConnection = true;
            continue;
        }

        if (c === "-") {
            negated = true;
        } else if (c === "+") {
            if (negated) {
                throw Error("invalid dnf \n(expected variable after '-')");
            }
            if (conjunctiveConnection) {
                throw Error("invalid dnf \n(expected variable after '*')");
            }
            if (disjunctiveConnection) {
                throw Error("invalid dnf \n(expected term between '+')");
            }
            if (Object.keys(termDict).length === 0) {
                throw Error("invalid dnf \n(expected term before '+')");
            }
            if (satisfiable) {
                // technically could return here, but need to make sure whole string is valid dnf
                anyTermSatisfiable = true;
            }
            disjunctiveConnection = true;
            termDict = {};
            satisfiable = true;
        } else if (c.match(/[a-z]/)) {
            if (c in termDict) {
                if (negated === termDict[c]) {
                    satisfiable = false;
                }
            } else {
                termDict[c] = !negated;
            }
            negated = false;
            conjunctiveConnection = false;
            disjunctiveConnection = false;
        } else {
            throw Error(`invalid dnf \n(unexpected character '${c}')`);
        }
    }

    if (negated) {
        throw Error("invalid dnf \n(expected variable after '-')");
    }
    if (conjunctiveConnection) {
        throw Error("invalid dnf \n(expected variable after '*')");
    }
    if (disjunctiveConnection) {
        throw Error("invalid dnf \n(expected term after '+')");
    }
    if (Object.keys(termDict).length === 0) {
        throw Error("invalid dnf \n(expected term before '+')");
    }

    // any of the previous terms or the last term
    return anyTermSatisfiable || satisfiable;
}
