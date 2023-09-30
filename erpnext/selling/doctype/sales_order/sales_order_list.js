frappe.listview_settings['Sales Order'] = {

	add_fields: ["base_grand_total", "customer_name", "currency", "delivery_date",
		"per_delivered", "per_billed", "status", "order_type", "name", "skip_delivery_note"],

	get_indicator: function (doc) {
		// Sort out special cases
		switch (doc.status) {
			case "Closed":
				return [__("Closed"), "green", "status,=,Closed"];
			case "On Hold":
				return [__("On Hold"), "orange", "status,=,On Hold"];
			case "Completed":
				return [__("Completed"), "green", "status,=,Completed"];
		}
		// Otherwise do some rounding to avoid rounding differences.
		let percent_delivered = flt(doc.per_delivered, precision('per_delivered', doc));
		let percent_billed = flt(doc.per_billed, precision('per_billed', doc));
		let grand_total = flt(doc.grand_total);
		if (!doc.skip_delivery_note && percent_delivered < 100) {
			if (frappe.datetime.get_diff(doc.delivery_date) < 0) {
				// not delivered & overdue
				return [__("Overdue"), "red",
					"per_delivered,<,100|delivery_date,<,Today|status,!=,Closed"];
			} else if (grand_total === 0) {
				// not delivered (zero amount order)
				return [__("To Deliver"), "orange",
					"per_delivered,<,100|grand_total,=,0|status,!=,Closed"];
			} else if (percent_billed < 100) {
				// not delivered & not billed
				return [__("To Deliver and Bill"), "orange",
					"per_delivered,<,100|per_billed,<,100|status,!=,Closed"];
			} else {
				// not billed
				return [__("To Deliver"), "orange",
					"per_delivered,<,100|per_billed,=,100|status,!=,Closed"];
			}
		} else if (percent_delivered === 100 && grand_total !== 0 && percent_billed < 100) {
			// to bill
			return [__("To Bill"), "orange",
				"per_delivered,=,100|per_billed,<,100|status,!=,Closed"];
		} else if (doc.skip_delivery_note && percent_billed < 100){
			return [__("To Bill"), "orange", "per_billed,<,100|status,!=,Closed"];
		}
	},

	onload: function(listview) {
		var method = "erpnext.selling.doctype.sales_order.sales_order.close_or_unclose_sales_orders";

		listview.page.add_menu_item(__("Close"), function() {
			listview.call_for_selected_items(method, {"status": "Closed"});
		});
		listview.page.add_menu_item(__("Re-open"), function() {
			listview.call_for_selected_items(method, {"status": "Submitted"});
		});

		listview.page.add_action_item(__("Sales Invoice"), ()=>{
			erpnext.bulk_transaction_processing.create(listview, "Sales Order", "Sales Invoice");
		});
		listview.page.add_action_item(__("Delivery Note"), ()=>{
			erpnext.bulk_transaction_processing.create(listview, "Sales Order", "Delivery Note");
		});
		listview.page.add_action_item(__("Advance Payment"), ()=>{
			erpnext.bulk_transaction_processing.create(listview, "Sales Order", "Payment Entry");
		});
	}
};
