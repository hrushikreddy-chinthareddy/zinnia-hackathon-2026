import * as xml2js from 'xml2js';

/* Example usage:
const agent = new Agent();
agent.setAgentId('12345');
agent.setUserType('Agent');
agent.addState('AK');
agent.addState('AL');
agent.setFirstName('John');
agent.setLastName('Doe');

console.log(agent.toXml());
*/

export class ToppanMerrillStorefrontAgent {
    private root: any;

    constructor() {
        this.root = {
            User: {
                $: {},
                AgentID: '',
                UserType: '',
                States: {
                    $: { Counter: '0' },
                    StateId: [],
                },
                FirstName: '',
                LastName: '',
                MiddleInitial: '',
                Title: '',
                Address1: '',
                Address2: '',
                City: '',
                State: '',
                PostCode: '',
                Phone1: '',
                Phone2: '',
                Cell: '',
                Fax: '',
                Pager: '',
                Email: '',
                WebAddress: '',
                AgentClass: '',
                OfficeCode: '',
                BillingCode: '',
                ReportingHierarchy: '',
                ManagerID: '',
                StateLicenseType: '',
                AgentStatus: '',
                Distribution: '',
                Company: '',
                Agency: '',
            },
        };
    }

    setAgentId(agentId: string) {
        this.root.User.AgentID = agentId;
    }

    setUserType(userType: string) {
        this.root.User.UserType = userType;
    }

    addState(stateId: string) {
        this.root.User.States.StateId.push(stateId);
        this.root.User.States.$.Counter = String(
            this.root.User.States.StateId.length
        );
    }

    setFirstName(firstName: string) {
        this.root.User.FirstName = firstName;
    }

    setLastName(lastName: string) {
        this.root.User.LastName = lastName;
    }

    setMiddleInitial(middleInitial: string) {
        this.root.User.MiddleInitial = middleInitial;
    }

    setTitle(title: string) {
        this.root.User.Title = title;
    }

    setAddress1(address1: string) {
        this.root.User.Address1 = address1;
    }

    setAddress2(address2: string) {
        this.root.User.Address2 = address2;
    }

    setCity(city: string) {
        this.root.User.City = city;
    }

    setState(state: string) {
        this.root.User.State = state;
    }

    setPostCode(postCode: string) {
        this.root.User.PostCode = postCode;
    }

    setPhone1(phone1: string) {
        this.root.User.Phone1 = phone1;
    }

    setPhone2(phone2: string) {
        this.root.User.Phone2 = phone2;
    }

    setCell(cell: string) {
        this.root.User.Cell = cell;
    }

    setFax(fax: string) {
        this.root.User.Fax = fax;
    }

    setPager(pager: string) {
        this.root.User.Pager = pager;
    }

    setEmail(email: string) {
        this.root.User.Email = email;
    }

    setWebAddress(webAddress: string) {
        this.root.User.WebAddress = webAddress;
    }

    setAgentClass(agentClass: string) {
        this.root.User.AgentClass = agentClass;
    }

    setOfficeCode(officeCode: string) {
        this.root.User.OfficeCode = officeCode;
    }

    setBillingCode(billingCode: string) {
        this.root.User.BillingCode = billingCode;
    }

    setReportingHierarchy(reportingHierarchy: string) {
        this.root.User.ReportingHierarchy = reportingHierarchy;
    }

    setManagerId(managerId: string) {
        this.root.User.ManagerID = managerId;
    }

    setStateLicenseType(stateLicenseType: string) {
        this.root.User.StateLicenseType = stateLicenseType;
    }

    setAgentStatus(agentStatus: string) {
        this.root.User.AgentStatus = agentStatus;
    }

    setDistribution(distribution: string) {
        this.root.User.Distribution = distribution;
    }

    setCompany(company: string) {
        this.root.User.Company = company;
    }

    setAgency(agency: string) {
        this.root.User.Agency = agency;
    }

    toXml(): string {
        const builder = new xml2js.Builder();
        return builder.buildObject(this.root);
    }
}
