frappe.listview_settings['Material Request'] = {

	add_fields: ["material_request_type", "status", "per_ordered", "per_received", "transfer_status"],

	get_indicator: function(doc) {
		let percent_ordered = flt(doc.per_ordered, precision('per_ordered', doc));
		let percent_received = flt(doc.per_received, precision('per_received', doc));
		if (doc.status=="Stopped") {
			return [__("Stopped"), "red", "status,=,Stopped"];
		}
		if (doc.docstatus == 2) {
			return;
		}
		if (doc.transfer_status) {
			switch (doc.transfer_status) {
				case "Not Started":
					return [__("Not Started"), "orange"];
				case "In Transit":
					return [__("In Transit"), "yellow"];
				case "Completed":
					return [__("Completed"), "green"];
			}
		}
		if (doc.docstatus == 1) {
			switch (percent_ordered) {
				case 0:
					return [__("Pending"), "orange", "per_ordered,=,0"];
				case 100:
					switch (doc.material_request_type) {
						case "Purchase":
							switch (percent_received) {
								case 100:
									return [__("Received"), "green", "per_received,=,100"];
								case 0:
									return [__("Ordered"), "green", "per_ordered,=,100"];
								default: // percent_received < 100 && percent_received > 0
									return [__("Partially Received"), "yellow", "per_received,<,100"];
							}
						case "Material Transfer":
							return [__("Transfered"), "green", "per_ordered,=,100"];
						case "Material Issue":
							return [__("Issued"), "green", "per_ordered,=,100"];
						case "Customer Provided":
							return [__("Received"), "green", "per_ordered,=,100"];
						case "Manufacture":
							return [__("Manufactured"), "green", "per_ordered,=,100"];
					}
					break;
				default: // percent_ordered < 100
					return [__("Partially ordered"), "yellow", "per_ordered,<,100"];
			}
		}
	}
};
