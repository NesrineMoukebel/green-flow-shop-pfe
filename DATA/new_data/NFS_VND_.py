import random
from deap import base, creator, tools, algorithms
import numpy as np
import cProfile
import pstats
import io
import random
import copy
from deap import tools
import os

# Load Problem Instances
def load_instances(base_dir, num_jobs, num_machines_list, num_instances):
    # Initialize storage
    instances_data = []

    for num_machines in num_machines_list:
        for instance in range(1, num_instances + 1):
            instance_data = {}
            # Define the problem structure
            instance_data["jobs"] = None
            instance_data["machines"] = num_machines
            instance_data["processing_times"] = []
            instance_data["energy_prices"] = {"6CW": {}, "CM": {}}
            instance_data["energy_consumption_rates"] = {"PS": [], "PB": []}

            # Parse Processing Times
            gap_file = f"VFR{num_jobs}_{num_machines}_{instance}_Gap.txt"
            gap_path = os.path.join(base_dir, gap_file)
            if os.path.exists(gap_path):
                with open(gap_path, "r") as file:
                    header = file.readline().strip().split()
                    num_jobs = int(header[0])
                    instance_data["jobs"] = num_jobs
                    processing_times = np.zeros((num_jobs, num_machines), dtype=int)

                    for job_id, line in enumerate(file):
                        values = list(map(int, line.strip().split()))
                        for i in range(0, len(values), 2):
                            machine_id = values[i]
                            processing_time = values[i + 1]
                            processing_times[job_id][machine_id] = processing_time
                    instance_data["processing_times"] = processing_times.tolist()
            else:
                print(f"Missing processing times file: {gap_file}")
                continue

            # Parse Energy Prices (6CW, CM)
            for tag in ["6CW"]:
                file_name = f"VFR{num_jobs}_{num_machines}_{instance}_Gap__{tag}.txt"
                file_path = os.path.join(base_dir, file_name)
                if os.path.exists(file_path):
                    with open(file_path, "r") as file:
                        lines = file.readlines()
                        time_horizon = int(lines[0].strip())
                        start_vector = list(map(int, lines[1].strip().split()))
                        end_vector = list(map(int, lines[2].strip().split()))
                        price_vector = list(map(float, lines[3].strip().split()))
                        instance_data["energy_prices"][tag] = {
                            "time_horizon": time_horizon,
                            "start": start_vector,
                            "end": end_vector,
                            "prices": price_vector,
                        }
                else:
                    print(f"Missing energy price file: {file_name}")

            # Parse Energy Rates (PS, PB)
            for tag in ["PS", "PB"]:
                file_name = f"VFR{num_jobs}_{num_machines}_{instance}_Gap_{tag}.txt"
                file_path = os.path.join(base_dir, file_name)
                if os.path.exists(file_path):
                    with open(file_path, "r") as file:
                        lines = file.readlines()
                        rates = list(map(int, lines[1].strip().split()))
                        instance_data["energy_consumption_rates"][tag] = rates
                else:
                    print(f"Missing energy rates file: {file_name}")

            # Add instance to the data
            instances_data.append(instance_data)

    return instances_data

def create_individual(machines,jobs,processing_times):
    # Randomly shuffle job order for each machine
    job_sequences = [random.sample(range(0, jobs), jobs) for _ in range(machines)]
    schedule = [[None for _ in range(jobs)] for _ in range(machines)]

    # Tracks when each job can start on its next machine
    job_completion_times = [0] * jobs

    for machine in range(machines):
        machine_time = 0  # Tracks when the machine is free
        for job_index in job_sequences[machine]:
            # Calculate the start time for the job on this machine
            # It's the maximum of:
            # 1. When the job completes on the previous machine (job_completion_times[job_index])
            # 2. When the machine becomes free (machine_time)
            if job_completion_times[job_index] > machine_time : 
                start_time = job_completion_times[job_index]
            else :
                start_time = machine_time

            # Store job details: job number (1-based) and start time
            schedule[machine][job_index] = (job_index, start_time)

            # Update times
            processing_time = processing_times[job_index][machine]
            machine_time = start_time + processing_time  # The machine is now busy till this time
            job_completion_times[job_index] = machine_time  # The job will be done by this time

        # Sort the schedule for the machine based on start times
        schedule[machine] = sorted(schedule[machine], key=lambda x: x[1])

    return schedule


##################################################################################
######################## Helper functions ########################################
##################################################################################

def dominates(fitness_a, fitness_b):
    makespan_a, tec_a = fitness_a
    makespan_b, tec_b = fitness_b
    return (makespan_a <= makespan_b and tec_a <= tec_b) and (makespan_a < makespan_b or tec_a < tec_b)


# Calculate TEC
def calculate_tec(schedule, processing_times, energy_prices, time_periods_start, time_periods_end, energy_rates):
    TEC = 0  # Total Energy Consumption

    for m, machine_schedule in enumerate(schedule):
        energy_rate = energy_rates[m]
        idx = 0  # Current time period index
        current_time = 0  # Tracks time progress on the machine


        for job, start_time in machine_schedule:
            processing_time = processing_times[job][m]


            # Ensure `current_time` aligns with both `start_time` and period start
            if current_time < start_time:
                current_time = start_time

            while processing_time > 0:
                # If all periods are exhausted, take the price of the last period
                if idx >= len(time_periods_end):
                    remaining_energy_price = energy_prices[-1]
                    energy_used = remaining_energy_price * energy_rate * processing_time
                    TEC += energy_used
                    current_time += processing_time
                    processing_time = 0
                    break

                # Skip to the next period if `current_time` exceeds the current period's end
                if current_time >= time_periods_end[idx]:
                    idx += 1
                    continue

                # Align `current_time` to the start of the current period if needed
                if current_time < time_periods_start[idx]:
                    current_time = time_periods_start[idx]

                # Calculate available time in the current period
                available_time_in_period = time_periods_end[idx] - current_time

                if processing_time <= available_time_in_period:
                    # Job fits entirely within the current period
                    energy_used = energy_prices[idx] * energy_rate * processing_time
                    TEC += energy_used

                    current_time += processing_time
                    processing_time = 0
                else:
                    # Job spans into the next period
                    energy_used = energy_prices[idx] * energy_rate * available_time_in_period
                    TEC += energy_used

                    processing_time -= available_time_in_period
                    current_time = time_periods_end[idx]
                    idx += 1  # Move to the next period




    return round(TEC, 2)
def get_energy_price(start_time, time_periods, energy_prices):
    for i, period_end in enumerate(time_periods):
        if start_time <= period_end:
            # Ensure the index is valid for energy_prices
            if i < len(energy_prices):
                return energy_prices[i]
            else:
                break  # Break if periods exceed the number of prices
    # Use the last energy price for time periods beyond the last defined end
    return energy_prices[-1]


# ## Calculate Cmax
def calculate_cmax(schedule,processing_times):
    try:
        machines = len(processing_times[0])
        jobs = len(schedule[0])
        job_id = schedule[machines - 1][jobs -1][0]
        
        makespan = schedule[machines - 1][jobs -1][1] + processing_times[job_id][machines - 1]
        return makespan
    except TypeError as e:
        #print("Schedule before error:", schedule)
        print("Error:", e)
        raise  
    


# ## Fitness evaluation
# Evaluate the individual's fitness (Cmax and TEC)
def evaluate(individual,processing_times,energy_consumption_rates,time_periods_end, time_periods_start, energy_prices):
    cmax = calculate_cmax(individual,processing_times)
    tec = calculate_tec(individual, processing_times, energy_prices, time_periods_start, time_periods_end, energy_consumption_rates)
    return cmax, tec


# Define the problem as a multi-objective optimization problem
creator.create("FitnessMulti", base.Fitness, weights=(-1.0, -1.0))  # Minimize Cmax and TEC
creator.create("Individual", list, fitness=creator.FitnessMulti)


def update_start_times_local(schedule, processing_times, machine_idx):
    """
    Updates the start times of jobs on the specified machine and all subsequent machines.
    """
    num_machines = len(schedule)

    # Iterate over the machines starting from machine_idx
    for machine in range(machine_idx, num_machines):
        for i in range(len(schedule[machine])):
            job, start_time = schedule[machine][i]
            processing_time = processing_times[job][machine]

            # Update the start time based on the previous job on the same machine
            if i > 0:
                prev_job, prev_start_time = schedule[machine][i - 1]
                prev_finish_time = prev_start_time + processing_times[prev_job][machine]
                #start_time = max(start_time, prev_finish_time)
                if prev_finish_time > start_time :
                    start_time = prev_finish_time

            # Ensure the job can only start after it finishes on the previous machine
            if machine > 0:
                prev_machine_finish_time = None

                # Check the finish time of the job on the previous machine
                for j in range(len(schedule[machine - 1])):
                    prev_job, prev_start_time = schedule[machine - 1][j]
                    if prev_job == job:
                        prev_machine_finish_time = prev_start_time + processing_times[prev_job][machine - 1]
                        break

                if prev_machine_finish_time is not None:
                    #start_time = max(start_time, prev_machine_finish_time)
                    if prev_machine_finish_time > start_time :
                        start_time = prev_machine_finish_time

            # Update the start time in the schedule
            schedule[machine][i] = (job, start_time)


# ## Update start times

def update_start_times(schedule, processing_times):
    num_machines = len(schedule)
    
    # Precompute finish times for each job on each machine
    finish_times = {}  # Key: (job, machine), Value: finish time
    
    for machine in range(num_machines):
        for i in range(len(schedule[machine])):
            job, start_time = schedule[machine][i]
            processing_time = processing_times[job][machine]
            
            # Update start_time based on previous job on the same machine
            if i > 0:
                prev_job, prev_start_time = schedule[machine][i - 1]
                prev_finish_time = finish_times.get((prev_job, machine), 0)
                start_time = max(start_time, prev_finish_time)
            
            # Update start_time based on the same job on the previous machine
            if machine > 0:
                prev_machine_finish_time = finish_times.get((job, machine - 1), 0)
                start_time = max(start_time, prev_machine_finish_time)
            
            # Update finish time for the current job on the current machine
            finish_time = start_time + processing_time
            finish_times[(job, machine)] = finish_time
            
            # Update the schedule with the new start time
            schedule[machine][i] = (job, start_time)
    
    return schedule

def repair_and_update(individual, machines, jobs, processing_times):
    """
    Repair infeasible schedules and update start times to ensure validity.
    """
    for m in range(machines):
        # Step 1: Identify duplicates and missing jobs
        jobs_seen = set()
        duplicates = []
        missing_jobs = set(range(jobs))  # Initialize with all jobs

        # First pass : Identify duplicates and missing jobs 
        for idx, (job_id, start_time) in enumerate(individual[m]):
            if job_id in jobs_seen:
                duplicates.append(idx)  # Record position of duplicate
            else:
                jobs_seen.add(job_id)
                missing_jobs.discard(job_id)  # Remove seen jobs from missing_jobs

        # Step 2: Replace duplicates with missing jobs
        repaired_machine_schedule = []
        missing_jobs = list(missing_jobs)  
        

        for idx, (job_id, start_time) in enumerate(individual[m]):
            if idx in duplicates:
                if missing_jobs:
                    # Replace duplicate with a missing job
                    missing_job = missing_jobs.pop()
                    repaired_machine_schedule.append((missing_job, 0))
            else:
                # Keep the original job
                repaired_machine_schedule.append((job_id, start_time))

        # Step 3: Add any remaining missing jobs to the end
        for missing_job in missing_jobs:
            repaired_machine_schedule.append((missing_job, 0))

        # Step 4: Update the machine's schedule
        individual[m] = repaired_machine_schedule

    # Step 5: Recalculate start times for all machines
    update_start_times(individual, processing_times)

def is_schedule_feasible(schedule, processing_times):
    """
    Check the feasibility of a schedule : 
       1. No job overlapping 
       2. Cross-machine constraints are respected
       3. No duplicates within the same machine
    """
    
    job_completion_times = {}  # {job: finish_time_on_previous_machine}
    
    
    # Iterate over machines (index determines the machine number)
    for machine_idx, machine_schedule in enumerate(schedule):
        previous_end_time = 0  # End time of the previous job on the same machine
        jobs_seen = set()  # Track jobs already scheduled on this machine

        for job, start_time in machine_schedule:
            # Check 0: Job must appear only once per machine
            if job in jobs_seen:
                #print(f"Job must appear only once per machine")
                return False
            jobs_seen.add(job)

            processing_time = processing_times[job][machine_idx]  # Get processing time for this job and machine

            # Check 1: Job starts after the previous job finishes on the same machine
            if start_time < previous_end_time:
                #print(f"job Job starts before the previous job finishes on the same machine ")
                return False

            # Check 2: Job starts after it finishes on the previous machine (cross-machine constraint)
            if job in job_completion_times and start_time < job_completion_times[job]:
                return False

            # Update job's completion time and previous job's end time
            end_time = start_time + processing_time
            job_completion_times[job] = end_time  # Update for cross-machine check
            previous_end_time = end_time  # Update for same-machine check

    return True

def print_full_schedule(individual):
    full_schedule = []
    # Iterate over all machines and their respective schedules
    for machine_index, machine_schedule in enumerate(individual):
        # Directly add the machine's schedule as a list of tuples (job, start_time)
        full_schedule.append(f"Machine {machine_index + 1}: {machine_schedule}")

    return full_schedule






##################################################################################
######################## NSGA OPERATORS ##########################################
##################################################################################

# ## Crossover

# ### Two point crossover

def cxTwoPoint(ind1, ind2, machines, jobs, processing_times):
    """
    Two-point crossover for flow shop scheduling problem.
    Swaps job sequences between two crossover points while preserving job order constraints.
    """
    # Select two random crossover points ensuring cxpoint1 < cxpoint2
    cxpoint1, cxpoint2 = sorted(random.sample(range(1, jobs), 2))  # Two unique points

    # Perform two-point crossover for each machine
    for m in range(machines):
        # Extract job numbers from tuples
        jobs_ind1 = [job[0] for job in ind1[m]]
        jobs_ind2 = [job[0] for job in ind2[m]]

        # Perform the swap on job numbers
        jobs_ind1[cxpoint1:cxpoint2], jobs_ind2[cxpoint1:cxpoint2] = (
            jobs_ind2[cxpoint1:cxpoint2],
            jobs_ind1[cxpoint1:cxpoint2],
        )

        # Reconstruct tuples using the swapped job numbers and original metadata
        ind1[m] = [(job_num, *job[1:]) for job_num, job in zip(jobs_ind1, ind1[m])]
        ind2[m] = [(job_num, *job[1:]) for job_num, job in zip(jobs_ind2, ind2[m])]

    repair_and_update(ind1,machines, jobs, processing_times)
    repair_and_update(ind2,machines, jobs, processing_times)

    return ind1, ind2
def pmx_crossover(parent1, parent2, processing_times):
    """
    Perform Partially Mapped Crossover (PMX) between two parents.
    Extract job IDs, apply crossover, and adjust start times.
    """
    if isinstance(processing_times, list):
        processing_times = np.array(processing_times)
    # Number of machines
    num_machines = len(parent1)

    # Extract job IDs from parents
    parent1_job_ids = [[job[0] for job in machine_schedule] for machine_schedule in parent1]
    parent2_job_ids = [[job[0] for job in machine_schedule] for machine_schedule in parent2]

    # Initialize child job IDs as copies of parents
    child1_job_ids = [list(machine) for machine in parent1_job_ids]
    child2_job_ids = [list(machine) for machine in parent2_job_ids]

    # Select random segment for crossover
    start_idx = random.randint(0, len(parent1_job_ids[0]) - 2)
    end_idx = random.randint(start_idx + 1, len(parent1_job_ids[0]) - 1)

    for machine in range(num_machines):
        # Create mappings for the crossover segment
        mapping1_to_2 = {}
        mapping2_to_1 = {}

        # Extract and swap the segments
        for i in range(start_idx, end_idx + 1):
            job1 = parent1_job_ids[machine][i]
            job2 = parent2_job_ids[machine][i]
            child1_job_ids[machine][i] = job2
            child2_job_ids[machine][i] = job1
            mapping1_to_2[job1] = job2
            mapping2_to_1[job2] = job1


        # Resolve duplicates in child1
        for i in range(len(child1_job_ids[machine])):
            if i < start_idx or i > end_idx:  # Outside the swapped segment
                job = parent1_job_ids[machine][i]
                while job in mapping2_to_1:  # Resolve duplicates using the mapping
                    job = mapping2_to_1[job]
                child1_job_ids[machine][i] = job

        # Resolve duplicates in child2
        for i in range(len(child2_job_ids[machine])):
            if i < start_idx or i > end_idx:  # Outside the swapped segment
                job = parent2_job_ids[machine][i]
                while job in mapping1_to_2:  # Resolve duplicates using the mapping
                    job = mapping1_to_2[job]
                child2_job_ids[machine][i] = job

    # Adjust start times for both children
    child1 = adjust_start_times(child1_job_ids, processing_times)
    child2 = adjust_start_times(child2_job_ids, processing_times)

    return child1, child2

def adjust_start_times(child, processing_times):
    # Ensure processing_times is a NumPy array
    if isinstance(processing_times, list):
        processing_times = np.array(processing_times)

    num_machines = len(child)
    job_ready_times = [0] * len(processing_times)

    for machine in range(num_machines):
        machine_ready_time = 0
        num_jobs = len(child[machine])

        for i in range(num_jobs):
            job_id = child[machine][i]


            processing_time = processing_times[job_id, machine]
            #start_time = max(machine_ready_time, job_ready_times[job_id])
            if machine_ready_time > job_ready_times[job_id]:
                start_time = machine_ready_time
            else:
                start_time = job_ready_times[job_id]

            end_time = start_time + processing_time

            child[machine][i] = (job_id, start_time)
            job_ready_times[job_id] = end_time
            # Update the machine's readiness for the next job
            machine_ready_time = end_time

    return child


# ### Unifrom crossover
def uniform_crossover(ind1, ind2, machines, jobs, processing_times, period_data):
    """
    Uniform crossover optimized for TEC.
    Swaps job allocations between parents probabilistically, prioritizing cheap periods.
    Each schedule is a list of machine schedules, where each machine schedule is a list of (job_id, start_time).
    """
    # Extract period data
    period_starts = period_data['start']
    period_ends = period_data['end']
    period_prices = period_data['prices']
    time_horizon = period_data['time_horizon']

    # Perform uniform crossover for each machine
    for m in range(machines):
        for i in range(len(ind1[m])):
            # Decide probabilistically which parent to take the job allocation from
            if random.random() < 0.5:  # 50% chance to swap
                ind1[m][i], ind2[m][i] = ind2[m][i], ind1[m][i]

            # Ensure the job is in a cheap period
            for schedule in [ind1, ind2]:
                job_id, start_time = schedule[m][i]
                pt = processing_times[job_id][m]

                # Check if the current allocation is in a cheap period
                is_cheap = False
                for s, e, p in zip(period_starts, period_ends, period_prices):
                    if s <= start_time and start_time + pt <= e and p < 0.12:
                        is_cheap = True
                        break

                # If not in a cheap period, find the cheapest valid interval
                if not is_cheap:
                    cheapest_start = None
                    cheapest_cost = float('inf')
                    for s, e, p in zip(period_starts, period_ends, period_prices):
                        if p >= 0.12:
                            continue  # Skip expensive periods
                        candidate_start = max(start_time, s)
                        if candidate_start + pt <= e:
                            cost = p * pt
                            if cost < cheapest_cost:
                                cheapest_cost = cost
                                cheapest_start = candidate_start

                    # Update the job's start time if a cheaper interval is found
                    if cheapest_start is not None:
                        schedule[m][i] = (job_id, cheapest_start)

    return ind1, ind2




# ## Mutation

# ### Swap mutation
def mutSwap(individual, processing_times):
    """
    Perform a swap mutation on a single machine's schedule.
    """
    # Select a random machine
    machine_idx = random.randint(0, len(individual) - 1)
    machine = individual[machine_idx]

    # Randomly choose two job positions to swap within the selected machine
    if len(machine) > 1:  # Ensure there are at least two jobs to swap
        job1, job2 = random.sample(range(len(machine)), 2)

        # Create new tuples for swapped jobs
        job1_tuple = (machine[job2][0], machine[job1][1])  # Swap job number of job2 into job1's position
        job2_tuple = (machine[job1][0], machine[job2][1])  # Swap job number of job1 into job2's position

        # Replace the tuples in the machine's schedule
        machine[job1] = job1_tuple
        machine[job2] = job2_tuple

        # Recalculate start times after the mutation
        update_start_times(individual, processing_times)

    return individual


# ### Inversion mutation
def inversion_mutation(schedule, machines, processing_times):

    
    new_schedule = [list(machine) for machine in schedule]
    num_jobs = len(processing_times)
    # Randomly select a machine
    machine = random.randint(0, machines - 1)

    # Extract job indexes and start times from the schedule of the selected machine
    job_indexes = [job[0] for job in new_schedule[machine]]
    start_times = [job[1] for job in new_schedule[machine]]

    # Ensure there are at least two jobs to perform inversion
    if len(job_indexes) < 2:
        return new_schedule

    # Randomly generate p1 and p2 within the valid range
    p1, p2 = sorted(random.sample(range(len(job_indexes)), 2))  # Pick two random indices and sort them
    # p1 = 0 
    # p2 = num_jobs - 1
    # Invert the sequence of jobs between p1 and p2
    inverted_job_indexes = (
        job_indexes[:p1] +
        job_indexes[p1:p2 + 1][::-1] +
        job_indexes[p2 + 1:]
    )

    # Apply the inverted job indexes back while preserving start times
    new_schedule[machine] = [(inverted_job_indexes[i], start_times[i]) for i in range(len(job_indexes))]

    # Recalculate the start times for the machine
    update_start_times_local(new_schedule, processing_times,machine)


    return new_schedule



# Total Energy Cost for a Job (given start time and machine)
def total_energy_cost(individual,processing_times,time_periods,energy_prices,energy_consumption_rates,job_index, machine_index, start_time):

    # Get the job number (from the individual schedule)
    job_number = individual[machine_index][job_index][0]

    # Get the processing time for this job on the given machine
    processing_time = processing_times[job_number][machine_index]

    # Calculate the end time of the job
    end_time = start_time + processing_time

    total_cost = 0  # Initialize total energy cost accumulator
    current_time = start_time  # Set the current time to the start time of the job

    energy_prices.append(energy_prices[-1])

    # Loop through all time periods (end times)
    for i in range(len(time_periods)):
        # Get the start and end times of the current period
        period_end = time_periods[i]

        # Check if the job is running during this period
        if current_time < period_end:
            # Energy price for the current period
            period_price = energy_prices[i]

            # Calculate the time the job is in this period
            if end_time < period_end :
                period_end_time = end_time
            else :
                period_end_time = period_end
            time_in_period = period_end_time - current_time

            if time_in_period > 0:  # Only add cost if there's overlap with the period
                # Add the energy cost for this period (time * price * consumption rate)
                total_cost += time_in_period * period_price * energy_consumption_rates[machine_index]

            # Move current time forward to the end of this period
            current_time = period_end_time

        # If the job has finished, break out of the loop
        if current_time >= end_time:
            break

    # Handle time beyond the last defined period
    if current_time < end_time:
        # Use the energy price of the last period for the remaining time
        remaining_time = end_time - current_time
        last_period_price = energy_prices[-1]  # Use the last price
        total_cost += remaining_time * last_period_price * energy_consumption_rates[machine_index]

    return total_cost

# Calculate cost efficiency for a job
def cost_efficiency(individual,processing_times,job_index, machine_index,time_periods,time_periods_start,energy_prices,energy_consumption_rates):
    start_time = individual[machine_index][job_index][1]  # Get start time of job
    processing_time = processing_times[individual[machine_index][job_index][0]][machine_index]  # Get processing time
    return total_energy_cost(individual,processing_times,time_periods,energy_prices,energy_consumption_rates,job_index, machine_index, start_time)



def calculate_tec_mach(schedule, processing_times, energy_consumption_rates, time_periods, energy_prices, machine_index):
    TEC = 0
    machine_schedule = schedule[machine_index]  # Select the schedule for the specific machine

    for job, start_time in machine_schedule:
        processing_time = processing_times[job - 1][machine_index]
        energy_rate = energy_consumption_rates[machine_index]

        # Calculate TEC for each time unit during the job's processing
        for t in range(start_time, start_time + processing_time):
            energy_price = get_energy_price(t, time_periods, energy_prices)
            TEC += energy_price * energy_rate

    return TEC

def machine_sequence_swap_logic(schedule, processing_times,machines, jobs, energy_prices, energy_consumption_rates, time_periods_end, time_periods_start,time_horizon): 
    
    tec_values = []
    solutions = []
    dominating_solution = None

    original_fitness = evaluate(schedule, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)
    original_tec, original_cmax = original_fitness[1], original_fitness[0]

    # Create a copy of the original schedule to modify
    new_schedule = [list(machine) for machine in schedule]

    for machine in range(machines):
        # Calculate TEC for the current machine and append it to the tec_values list
        tec = calculate_tec_mach_vnd(schedule, processing_times, energy_prices, time_periods_start, time_periods_end, energy_consumption_rates,machine)
        tec_values.append(tec)

    # Sort the TEC values and select the machine with the highest TEC and the machine with the second-highest TEC
    sorted_tec_indices = sorted(range(machines), key=lambda x: tec_values[x], reverse=True)
    i = 0

    while (i < machines):
        
        machine1 = sorted_tec_indices[i]  # The machine with the highest TEC
        machine2 = sorted_tec_indices[i + 1]  # The machine with the second-highest TEC

        # Extract job indexes from the schedules of the two machines
        job_indexes1 = [job[0] for job in new_schedule[machine1]]
        job_indexes2 = [job[0] for job in new_schedule[machine2]]

        # Swap the job indexes between the two machines
        for i, job in enumerate(schedule[machine1]):
            new_schedule[machine1][i] = (job_indexes2[i], job[1])

        for i, job in enumerate(schedule[machine2]):
            new_schedule[machine2][i] = (job_indexes1[i], job[1])

        # Recalculate the start times for the machines
        update_start_times(new_schedule, processing_times)

        # Calculate the new fitness
        new_fitness = evaluate(new_schedule, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)

        new_tec, new_cmax = new_fitness[1], new_fitness[0]
        delta_tec = new_tec - original_tec
        delta_cmax = new_cmax - original_cmax
        
        if delta_tec == 0 and delta_cmax == 0:
            continue

        # Check if the new solution dominates the original one
        if new_cmax <= time_horizon:
            if dominates(new_fitness, original_fitness):
                dominating_solution = (new_schedule, new_fitness)
                return solutions, dominating_solution
            else:
                # Store non-dominating solutions with improvement in one objective
                if (delta_tec < 0 and delta_cmax > 0) or (delta_cmax < 0 and delta_tec > 0):
                    solutions.append((new_schedule, new_fitness))

        i += 1
  
    return solutions, dominating_solution

def calculate_tec_mach_vnd(schedule, processing_times, energy_prices, time_periods_start, time_periods_end, energy_rates,machine_index):
    Tec = 0  # Total Energy Consumption
    
    energy_rate = energy_rates[machine_index]
    idx = 0  # Current time period index
    current_time = 0  # Tracks time progress on the machine

    for job, start_time in schedule[machine_index]:
        processing_time = processing_times[job][machine_index]

        # Ensure `current_time` aligns with both `start_time` and period start
        if current_time < start_time:
            current_time = start_time

        while processing_time > 0:
            # If all periods are exhausted, take the price of the last period
            if idx >= len(time_periods_end):
                remaining_energy_price = energy_prices[-1]
                energy_used = remaining_energy_price * energy_rate * processing_time
                Tec += energy_used
                current_time += processing_time
                processing_time = 0
                break

            # Skip to the next period if `current_time` exceeds the current period's end
            if current_time >= time_periods_end[idx]:
                idx += 1
                continue

            # Align `current_time` to the start of the current period if needed
            if current_time < time_periods_start[idx]:
                current_time = time_periods_start[idx]

            # Calculate available time in the current period
            available_time_in_period = time_periods_end[idx] - current_time

            if processing_time <= available_time_in_period:
                # Job fits entirely within the current period
                energy_used = energy_prices[idx] * energy_rate * processing_time
                Tec += energy_used
                current_time += processing_time
                processing_time = 0
            else:
                # Job spans into the next period
                energy_used = energy_prices[idx] * energy_rate * available_time_in_period
                Tec += energy_used
                processing_time -= available_time_in_period
                current_time = time_periods_end[idx]
                idx += 1  # Move to the next period
    return Tec


def calculate_cmax_mach(schedule, processing_times, machine_index):
    machine_schedule = schedule[machine_index]  # Select the schedule for the specific machine

    if not machine_schedule:  # Handle empty schedule
        return 0

    # Calculate end times for all jobs on the machine
    job_end_times = [
        start_time + processing_times[job_id][machine_index]
        for job_id, start_time in machine_schedule
    ]

    # The makespan is the maximum of the end times
    return max(job_end_times)


# #### Swap mutation with logic
# The function selects a machine randomly, then either randomly or based on cost efficiency, chooses jobs to move within that machine’s schedule. It attempts to insert these jobs at a random position within the machine's schedule
# 
# We choose the job with the highest cost efficiency because it is the most expensive in terms of energy used for the time it takes to process. By moving or adjusting this job, we can try to reduce the total energy cost and make the schedule more efficient.

def insert_jobs_within_machine(schedule, processing_times, energy_prices, energy_consumption_rates, time_periods, time_periods_start, num_jobs_to_insert=1):

    # Step 1: Randomly select a machine from the list of machines
    num_machines = len(schedule)

    tec_values = []

    # Loop through each machine to calculate TEC
    for machine in range(num_machines):
        # Calculate TEC for the current machine and append it to the tec_values list
        tec = calculate_tec_mach(schedule, processing_times, energy_consumption_rates, time_periods, energy_prices, machine)
        tec_values.append(tec)

    # Select machines with the highest TEC
    machine_index = max(range(num_machines), key=lambda x: tec_values[x])
    selected_machine_schedule = schedule[machine_index]

    # Step 2: Select jobs based on logic (cost efficiency)
    # Step 1: Create a list of job indices sorted by cost efficiency (highest to lowest)
    sorted_indices = sorted(
        range(len(selected_machine_schedule)),
        key=lambda idx: cost_efficiency(
            schedule, processing_times, idx, machine_index, time_periods, time_periods_start, energy_prices, energy_consumption_rates
        ),
        reverse=True  # Sort in descending order of cost efficiency
    )

    # Step 2: Select the first `num_jobs_to_insert` jobs from the sorted structure
    jobs_to_move = [selected_machine_schedule[idx] for idx in sorted_indices[:num_jobs_to_insert]]

    # Step 3: Randomly select a position to insert the jobs within the same machine
    insert_position = random.randint(0, len(selected_machine_schedule))

    # Step 4: Remove the selected jobs from their original position in the schedule
    selected_machine_schedule = [
        job for job in selected_machine_schedule if job not in jobs_to_move
    ]

    # Step 5: Insert the selected jobs at the chosen position in the schedule
    schedule[machine_index] = (
        selected_machine_schedule[:insert_position]
        + jobs_to_move
        + selected_machine_schedule[insert_position:]
    )

    # Step 6: Recalculate the start times after the insertion in the schedule
    update_start_times(schedule, processing_times)

    # Return the modified schedule directly
    return schedule


##################################################################################
######################## Population initialization ########################################
##################################################################################


# ### NFS heuristic
def nfs_heuristic(machines, jobs, processing_times, p, energy_consumption_rates, energy_prices, time_periods):
    """
    Non-permutation flowshop scheduling algorithm with straight insertion, anticipation, and delay while includeing start times for makespan calculation.
    """

    def calculate_makespan(schedule, processing_times, machines, global_job_completion):
        """
        Calculate the makespan for a given schedule on all machines.
        """
        max_completion = 0
        for machine in range(machines):
            completion_time = 0
            for idx, job in enumerate(schedule):
                if machine == 0:
                    # First machine: Sum processing times
                    completion_time += processing_times[job][machine]
                else:
                    # Other machines: Consider the previous machine's job completion time

                    #completion_time = max(completion_time, prev_machine_time) + processing_times[job][machine]
                    prev_machine_time = global_job_completion[job][machine - 1]
                    if completion_time > prev_machine_time :
                        completion_time = completion_time + processing_times[job][machine]
                    else :
                        completion_time = prev_machine_time + processing_times[job][machine]



                # Update the global completion time for this job and machine
                global_job_completion[job][machine] = completion_time

            #max_completion = max(max_completion, completion_time)

            if max_completion < completion_time:
                max_completion = completion_time

        return max_completion

    # def calculate_makespan(schedule, processing_times, machines, global_job_completion):
    #     """
    #     Calculate the makespan for a given schedule on all machines.
    #     """
    #     max_completion = 0

    #     for machine in range(machines):
    #         completion_time = 0

    #         if machine == 0:
    #             # First machine: Sum processing times directly
    #             for job in schedule:
    #                 completion_time += processing_times[job][machine]
    #                 global_job_completion[job][machine] = completion_time
    #         else:
    #             # Other machines: Use the previous machine's completion times
    #             for job in schedule:
    #                 prev_machine_time = global_job_completion[job][machine - 1]
    #                 completion_time = max(completion_time, prev_machine_time) + processing_times[job][machine]
    #                 global_job_completion[job][machine] = completion_time

    #         # Update the maximum completion time
    #         if completion_time > max_completion:
    #             max_completion = completion_time

    #     return max_completion
    
    def insert_at_best_position(schedule, job, processing_times, global_job_completion, machines):
        best_makespan = float('inf')
        best_position = 0

        # for pos in range((len(schedule) // 10) + 1):
        for pos in range((len(schedule) // 10 ) + 1):
            # Create a temporary schedule
            temp_schedule = schedule[:pos] + [job] + schedule[pos:]

            # Create a deep copy of the global completion times for testing
            temp_global_completion = {k: v[:] for k, v in global_job_completion.items()}

            # Calculate makespan for this temporary schedule
            makespan = calculate_makespan(temp_schedule, processing_times, machines, temp_global_completion)

            # Update the best position if this makespan is better
            if makespan < best_makespan:
                best_makespan = makespan
                best_position = pos

        # Insert the job at the best position
        schedule.insert(best_position, job)
        calculate_makespan(schedule, processing_times, machines, global_job_completion)  # Update global job completion
        return schedule


    # Initialize the schedules
    partial_schedules = [[] for _ in range(machines)]
    global_job_completion = {job: [0] * machines for job in range(jobs)}
    job_completion_times = [0] * jobs


    # Step 1: Generate a random order of jobs
    job_order = list(range(jobs))
    random.shuffle(job_order)


    # Phase 1: Insert the pxn jobs in the optimal positions directly on all machines
    pn = int(np.floor(p * jobs))
    current_schedule = []

    if pn >= 1:
        # Select the first pn jobs based on the random order
        selected_jobs = job_order[:pn]

        # Compute total processing times for the selected jobs
        total_processing_times = [sum(processing_times[job]) for job in selected_jobs]

        # Choose the first job with the maximum total processing time
        first_job = selected_jobs[np.argmax(total_processing_times)]
        current_schedule.append(first_job)

        # Remaining jobs to be selected
        remaining_jobs = [job for job in selected_jobs if job != first_job]

        # Insert remaining jobs at the best position
        for j in remaining_jobs:
            current_schedule = insert_at_best_position(current_schedule, j, processing_times, global_job_completion, machines)

        for i in range(machines):
            partial_schedules[i] = current_schedule



    # Phase 2: Non-permutation insertions (anticipation and delay logic remains unchanged)
    remaining_jobs = [job for job in range(jobs) if job not in current_schedule]

    for idx, job in enumerate(remaining_jobs):
        best_makespan = float("inf")
        best_schedules = None

        # Try each position in the current schedule
        for k in range(len(current_schedule) + idx + 1):
            temp_schedules = [schedule[:] for schedule in partial_schedules]

            num_machines_to_insert = random.randint(0, machines // 2)

            # Insert job at position k in the first machines
            for i in range(num_machines_to_insert):
                temp_schedules[i].insert(k, job)


            # 1. Evaluate straight insertion
            straight_schedules = [schedule[:] for schedule in temp_schedules]
            for m in range(num_machines_to_insert, machines):
                straight_schedules[m].insert(k, job)
            straight_makespan = calculate_makespan(straight_schedules[0], processing_times, machines, global_job_completion)

            if straight_makespan < best_makespan:
                best_makespan = straight_makespan
                best_schedules = straight_schedules


            # 2. Evaluate anticipation insertions
            for pos in range(k-1,k):
                anticipation_schedules = [schedule[:] for schedule in temp_schedules]
                for m in range(num_machines_to_insert, machines):
                    anticipation_schedules[m].insert(pos, job)
                anticipation_makespan =  calculate_makespan(anticipation_schedules[num_machines_to_insert], processing_times, machines, global_job_completion)

                if anticipation_makespan < best_makespan:
                    best_makespan = anticipation_makespan
                    best_schedules = anticipation_schedules


            # 3. Evaluate delay insertions
            for pos in range(k+1, k+2):
                delay_schedules = [schedule[:] for schedule in temp_schedules]
                for m in range(num_machines_to_insert, machines):
                    delay_schedules[m].insert(pos, job)
                delay_makespan = calculate_makespan(delay_schedules[num_machines_to_insert], processing_times, machines, global_job_completion)

                if delay_makespan < best_makespan:
                    best_makespan = delay_makespan
                    best_schedules = delay_schedules



        # Update schedules with the best configuration
        if best_schedules is not None:
            partial_schedules = best_schedules[:] #copy.deepcopy(best_schedules)


    # Final step: Calculate start times for the final schedule
    # Initialize final_schedule as a list of empty lists, one for each machine
    final_schedule = [[] for _ in range(machines)]

    # Loop through each machine and update the final schedule
    for i in range(machines):
        current_time = 0
        job_start_times = []

        for job in partial_schedules[i]:
            # Calculate the start time of the job
            # start_time = max(current_time, job_completion_times[job])
            if current_time > job_completion_times[job] :
                start_time = current_time
            else :
                start_time = job_completion_times[job]

            job_start_times.append((job, start_time))

            # Update job completion time and current time
            job_completion_times[job] = start_time + processing_times[job][i]
            current_time = job_completion_times[job]

        # Sort by start time
        job_start_times.sort(key=lambda x: x[1])

        # Append sorted jobs to the corresponding machine in final_schedule
        for job, start_time in job_start_times:
            final_schedule[i].append((job, start_time))


    return final_schedule

def is_job_sequence_identical(schedule):
    # Check if all machines have the same sequence of jobs
    first_machine_schedule = [job for job, _ in schedule[1]]  # Extract job sequence for first machine
    for machine_schedule in schedule[2:]:
        if [job for job, _ in machine_schedule] != first_machine_schedule:
            return False
    return True

def get_similarity(ind1, ind2):
    # Flatten the schedules to get job IDs in their respective order
    ind1_ids = [job[0] for machine_schedule in ind1 for job in machine_schedule]
    ind2_ids = [job[0] for machine_schedule in ind2 for job in machine_schedule]

    # Ensure both individuals have the same length
    if len(ind1_ids) != len(ind2_ids):
        raise ValueError("Schedules must have the same number of jobs to calculate similarity.")

    # Create a vector with 1 if jobs match, 0 otherwise
    similarity_vector = [1 if ind1_ids[i] == ind2_ids[i] else 0 for i in range(len(ind1_ids))]

    # Calculate the similarity percentage
    similarity_percentage = sum(similarity_vector) / len(similarity_vector) * 100

    return similarity_percentage

def left_shift_schedule(schedule, processing_times, period_ends, job_info, chosen_periods):
    num_machines = len(schedule)
    chosen_periods_sorted = sorted(chosen_periods, key=lambda x: x[0])  # Sort chosen_periods by start time (chronological order)

    horizon_end = max(period_ends)  # Ensure jobs stay within the defined horizon

    for m in range(num_machines):
        for j in range(len(schedule[m])):
            job_id = schedule[m][j][0]
            pt = processing_times[job_id][m]

            max_shift = 0
            if j > 0:
                max_shift = max(max_shift, job_info[schedule[m][j-1][0]][m]['end'])
            if m > 0:
                max_shift = max(max_shift, job_info[job_id][m-1]['end'])

            # Find the earliest period in chosen_periods where the job can fit
            best_period = None
            for p_idx, p in enumerate(chosen_periods_sorted):
                if p[1] >= max_shift and p[1] - max_shift >= pt:
                    best_period = p
                    break
                # Check if the job can span across two contiguous from thee chosen periods
                if p_idx < len(chosen_periods_sorted) - 1 :
                    next_p = chosen_periods_sorted[p_idx + 1]
                    if p[1] + 1 == next_p[0] and p[2] < next_p[2]:  # Contiguous and cheaper
                        if p[1] >= max_shift and next_p[1] - max_shift >= pt:
                            best_period = p
                            break

            if best_period is None:
                break

            new_start = max(max_shift, best_period[0]) # for the first job on the first machine (in case the very first period isn't the cheapest)
            new_end = new_start + pt

            # Ensure job does not exceed the scheduling horizon
            if new_end > horizon_end:
                new_start = horizon_end - pt
                new_end = horizon_end

            # Ensure job doesn't overlap with previous jobs
            if j > 0:
                new_start = max(new_start, job_info[schedule[m][j-1][0]][m]['end'])
            if m > 0:
                new_start = max(new_start, job_info[job_id][m-1]['end'])

            new_end = new_start + pt
            if new_end > horizon_end:
                return job_info

            # update the info 
            job_info[job_id][m]['start'] = new_start
            job_info[job_id][m]['end'] = new_end

    return job_info
 
def right_shift_schedule(schedule, processing_times, period_ends, job_info, chosen_periods):
    num_machines = len(schedule)
    chosen_periods_sorted = sorted(chosen_periods, key=lambda x: x[0])
    horizon_end = max(period_ends)

    def get_period_for_time(time):
        """Helper function to find which period a time belongs to"""
        return next((p for p in chosen_periods_sorted if p[0] <= time <= p[1]), None)
    
    def has_more_expensive_period_before(period):
        """Check if there are any more expensive periods before the given period"""
        period_idx = chosen_periods_sorted.index(period)
        return any(p[2] > period[2] for p in chosen_periods_sorted[:period_idx])

    def get_latest_allowed_end(machine, job_idx, job_id):
        """Calculate the latest possible end time for a job given constraints"""
        # Constraint 1: Must end before the next job on same machine 
        if job_idx < len(schedule[machine]) - 1:
            next_job_id = schedule[machine][job_idx + 1][0]
            allowed_end = job_info[next_job_id][machine]['start']
        else: #it's the last job on the current machine 
            allowed_end = horizon_end #we set it to the horizon end in case it's the last job on the last machine and the cheapest period is the last one
            
        # Constraint 2: Must end before job starts on next machine
        if machine < num_machines - 1:
            next_machine_start = job_info[job_id][machine + 1]['start']
            allowed_end = min(allowed_end, next_machine_start)
            
        return allowed_end

    # Process machines in reverse order
    for m in range(num_machines - 1, -1, -1):
        # Process jobs in reverse order
        for j in reversed(range(len(schedule[m]))):
            job_id = schedule[m][j][0]
            pt = processing_times[job_id][m]
            current_start = job_info[job_id][m]['start']
            current_end = job_info[job_id][m]['end']
            
            # Find current period and maximum allowed end time
            current_period = get_period_for_time(current_start)
            if not current_period: #if the job is not assigned to any of the periods
                continue
                
            allowed_end = get_latest_allowed_end(m, j, job_id)
            if allowed_end <= current_end:
                continue  # No room to shift
                
            # Initialize best timing
            best_start = current_start
            best_end = current_end

            # Get the index of the current period
            current_period_idx = chosen_periods_sorted.index(current_period)

            # Check if there is a more expensive period before the current period
            has_expensive_period_before = has_more_expensive_period_before(current_period)
            
            assigned = False 
            # Try to shift the job to a cheaper period in the periods that come after the current one (from the chosen periods)
            for period in chosen_periods_sorted[current_period_idx + 1:]:
                if period[2] >= current_period[2]:
                    continue  # Skip same or more expensive periods because no need to shift to them


                 
                # We check if the job can start in this period and end in a contiguous period
                start_in_period = max(period[0], allowed_end - pt) 
                end_in_period = start_in_period + pt

                # Case 1 : Job fits entirely in this period 
                if period[0] <= start_in_period and end_in_period <= period[1]:
                    best_start = start_in_period
                    best_end = end_in_period
                    break  # Stop searching, we found a valid shift

                # Case 2: Job spans into a contiguous cheaper period
                else:
                    # Find the next contiguous period
                    period_idx = chosen_periods_sorted.index(period)
                    if period_idx < len(chosen_periods_sorted) - 1 :
                        next_period = chosen_periods_sorted[period_idx + 1]
                        if period[1] + 1 == next_period[0] :  # Periods are contiguous
                            # Check if the job can span into the next period
                            time_in_first_period = period[1] - start_in_period
                            time_in_second_period = pt - time_in_first_period

                            if time_in_second_period <= next_period[1] - next_period[0]:
                                best_start = start_in_period
                                best_end = start_in_period + pt
                                break  # We stop searching because we found a valid shift

            # If there is a more expensive period before the current period and no cheaper period was found,
            # schedule the job as late as possible within the current period
            if has_expensive_period_before and best_start == current_start and best_end == current_end or has_expensive_period_before:
               
            
                #latest_start = min(current_period[1] - pt, allowed_end - pt)
                latest_start = max(current_period[1] - pt, allowed_end - pt)
                if latest_start >= current_period[0]:
                    best_start = latest_start
                    best_end = latest_start + pt
                
                

            # If there is no more expensive period before the current period and no cheaper period was found,
            # leave the job where it is
            elif not has_expensive_period_before and best_start == current_start and best_end == current_end:
                
                continue

            # Update job info if we found a better schedule
            if best_start >= 0 and best_end <= horizon_end:
                
                if (j < len(schedule[m]) - 1 and best_end > job_info[schedule[m][j + 1][0]][m]['start']) or \
                   (m < num_machines - 1 and best_end > job_info[job_id][m + 1]['start']):
                    
                    if j < len(schedule[m]) - 1 : 
                        best_end = job_info[schedule[m][j + 1][0]][m]['start']
                    
                    if m < num_machines - 1 : 
                        best_end = min(best_end, job_info[job_id][m + 1]['start'])
                        
                    
                    
                    
                
                best_period = get_period_for_time(best_end)
                if best_period and (best_period[2] > current_period[2]) :
                    continue
                job_info[job_id][m]['end'] = best_end
                job_info[job_id][m]['start'] = best_end - pt
                best_start = best_end - pt
                schedule[m][j] = (job_id, best_start)
               
    return job_info

def tec_reducer(schedule, processing_times, period_starts, period_ends, prices):

    num_machines = len(schedule)
    num_jobs = len(processing_times)
    job_info = [{} for _ in range(num_jobs)]

    # (1) Compute cmax of the initial schedule 
    cmax = calculate_cmax(schedule, processing_times)
   

    # (2) Choose periods from cheapest to most expensive, covering cmax
    #all_periods = sorted(zip(period_starts, period_ends, prices), key=lambda x: (x[2], x[0]))
    periods = list(zip(period_starts, period_ends, prices))

    all_periods = sorted(
        periods,
        key=lambda x: (
            x[2],  # Sort by price first
            not (
                (periods.index(x) > 0 and periods[periods.index(x) - 1][2] < x[2]) or
                (periods.index(x) < len(periods) - 1 and periods[periods.index(x) + 1][2] < x[2])
            ),  # Prioritize adjacency to a cheaper period
            x[0]  # Use start time as a final tiebreaker
        )
    )
    chosen_periods = []
    remaining = cmax
    for (ps, pe, pr) in all_periods:
        if remaining <= 0:
            break
        duration = pe - ps
        chosen_periods.append((ps, pe, pr))
        remaining -= duration

    while remaining > 0:
        for (ps, pe, pr) in all_periods:
            duration = pe - ps
            chosen_periods.append((ps, pe, pr))
            remaining -= duration
            if remaining <= 0:
                break

    # Sort periods by end time for backward scheduling
    chosen_periods.sort(key=lambda x: x[1], reverse=True)
    
    # Helper function to check if periods are contiguous
    def are_periods_contiguous(period1, period2):
        return period1[1] + 1  == period2[0]

    # Start with the last job on the last machine
    last_machine = num_machines - 1
    last_job_idx = len(schedule[last_machine]) - 1

    # Initialize with first (latest) period
    current_period_idx = 0
    current_period = chosen_periods[current_period_idx]

    # Schedule the very last job
    last_job_id = schedule[last_machine][last_job_idx][0]
    last_job_pt = processing_times[last_job_id][last_machine]

    # Place it at the end of the latest period
    job_info[last_job_id][last_machine] = {
        'start': current_period[1] - last_job_pt,
        'end': current_period[1]
    }

    # Process remaining jobs backward
    for m in reversed(range(num_machines)):
        start_j = len(schedule[m]) - 1 if m != last_machine else last_job_idx - 1

        for j in reversed(range(start_j + 1)):
            current_period_idx = 0
            current_period = chosen_periods[current_period_idx]
            current_job_id = schedule[m][j][0]
            pt = processing_times[current_job_id][m]

            # Find the latest possible end time based on constraints
            latest_possible_end = float('inf')

            # Constraint 1: Must end before the next job on the same machine
            if j < len(schedule[m]) - 1:
                next_job_id = schedule[m][j + 1][0]
                next_job_start = job_info[next_job_id][m]['start']
                latest_possible_end = next_job_start

            # Constraint 2  : Must end before the same job starts on next machine
            if m < num_machines - 1:
                next_machine_jobs = [job_id for job_id, _ in schedule[m + 1]]
                if current_job_id in next_machine_jobs:
                    next_machine_start = job_info[current_job_id][m + 1]['start']
                    latest_possible_end = min(latest_possible_end, next_machine_start)

            # If no constraints found (case of the last job), use current period end
            if latest_possible_end == float('inf'):
                latest_possible_end = current_period[1]

            # Calculate initial job timing
            job_end = latest_possible_end
            job_start = job_end - pt

            # Find appropriate periods for the job
            placed = False
            while not placed:
                
                # Check if job fits entirely in the current period
                if job_end <= current_period[1] and job_start >= current_period[0]:
                    placed = True
                # Check if job can span between current period and next chosen period
                elif (current_period_idx < len(chosen_periods) - 1 and
                      are_periods_contiguous(chosen_periods[current_period_idx + 1], current_period) and
                      job_end <= current_period[1] and
                      job_start >= chosen_periods[current_period_idx + 1][0]):
                    
                    #print(f"hereee")
                    
                    # Ensure both periods are chosen
                    if (current_period in chosen_periods and
                        chosen_periods[current_period_idx + 1] in chosen_periods):
                        placed = True
                else:
                    # Move to the next chosen period
                    current_period_idx += 1
                    if current_period_idx >= len(chosen_periods):
                        break
                    current_period = chosen_periods[current_period_idx]
                    # Place at the end of this period and check constraints again
                    job_end = min(current_period[1], latest_possible_end)
                    job_start = job_end - pt

            # Store the job timing
            job_info[current_job_id][m] = {
                'start': job_start,
                'end': job_end
            }

    
    
    job_info = left_shift_schedule(schedule, processing_times, period_ends, job_info, chosen_periods)
    if random.random() > 0.5 : 
        job_info = right_shift_schedule(schedule, processing_times, period_ends, job_info, chosen_periods)

    # Build final schedule 
    final_schedule = []
    for m in range(num_machines):
        machine_schedule = []
        for job_id, _ in schedule[m]:
            start_time = job_info[job_id][m]['start']
            machine_schedule.append((job_id, start_time))
        final_schedule.append(machine_schedule)

    return final_schedule



def init_population(processing_times, energy_prices, energy_consumption_rates, size_pop, time_periods, time_periods_start, time_periods_end, jobs, machines):
    population = []

    # First solution using NFS heuristic
    nfs_size = int(0.2*size_pop)

    random_size = size_pop - nfs_size

    start_value = 0.1
    increment = round((1 - start_value) / (nfs_size - 1), 2)  # Distribute the values across the range from start_value to 1

    # Generate alpha values dynamically
    p_values = [round(start_value + i * increment, 2) for i in range(nfs_size)]

    existing_schedules = []
    cpt = 0
    idx = 0
    for p in p_values:
        #print(f"p value : {p}")
        while True:
            # Generate a schedule using the NFS heuristic
            initial_time = time.time()
            schedule = nfs_heuristic(machines, jobs, processing_times, p, energy_consumption_rates, energy_prices, time_periods)
            final_time = time.time()
            exec_time_nfs = final_time - initial_time
            # Ensure the schedule is feasible
            if not is_schedule_feasible(schedule, processing_times):
                continue

            # Check similarity with existing schedules
            similar = False
            #print(f"schedule :{schedule}")
            # for existing_schedule in existing_schedules:
            #     similarity_percentage = get_similarity(schedule, existing_schedule)
            #     if similarity_percentage >= 70:  # If similarity is >= 70%, reject the schedule
            #         print("The individual is similar to one of the schedules")
            #         similar = True
            #         break
            if not similar:  # If the schedule is sufficiently different, accept it
                cpt+=1
                schedule_copy =  [list(machine) for machine in schedule]
                population.append(creator.Individual(schedule_copy)) 
                
                #population.append(creator.Individual(copy.deepcopy(new)))

                existing_schedules.append(schedule_copy)
                print(f"individual {idx} done after {exec_time_nfs}: {calculate_cmax(schedule, processing_times)}")
                break  # Move to the next individual
        idx+=1

    
    for _ in range(random_size ) :
        new_individual = create_individual(machines, jobs, processing_times)

        schedule_copy =  [list(machine) for machine in new_individual]
        population.append(creator.Individual(schedule_copy))
        
    
    print(f"pop done !")
    
    return population



##################################################################################
######################## VND FUNCTIONS ## ########################################
##################################################################################

def insert_jobs_within_machine2(schedule, processing_times,machines,jobs, energy_prices, energy_consumption_rates, time_periods_end, time_periods_start,time_horizon):

    solutions = []
    dominating_solution = None

    original_fitness = evaluate(schedule, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)
    original_tec, original_cmax = original_fitness[1], original_fitness[0]
    
    essay = 0
    maxessay = round(2 + (jobs - 10) * (10 - 2) / (800 - 10))

    while essay < maxessay:
        essay += 1

        num_jobs_to_insert = random.randint(1, int(jobs/10))

        for machine_index, machine in enumerate(schedule):

            new_schedule = [list(machine) for machine in schedule]

            # Step 2: Select a subsequence of jobs to move
            if len(machine) < num_jobs_to_insert:
                continue  # Skip this machine if there are not enough jobs to move

            t = 0
            valid_subsequence_found = False
            while not valid_subsequence_found and t < 10:
                start_index = random.randint(0, len(machine) - num_jobs_to_insert)
            
                if start_index + num_jobs_to_insert <= len(machine):
                    subsequence = machine[start_index:start_index + num_jobs_to_insert]
                    valid_subsequence_found = True  # Exit while loop once a valid subsequence is found
                else:
                    # If not valid, keep trying by looping again
                    continue
                t += 1

            if not valid_subsequence_found:
                continue
            # Step 3: Remove the selected subsequence from its original position
            new_schedule[machine_index] = machine[:start_index] + machine[start_index + num_jobs_to_insert:]

            # Step 4: Insert the subsequence at a random position within the machine's schedule
            insert_position = random.randint(0, len(new_schedule[machine_index]))
            new_schedule[machine_index] = new_schedule[machine_index][:insert_position] + subsequence + new_schedule[machine_index][insert_position:]

            # Step 5: Set the start times of the inserted jobs to 0
            for i in range(num_jobs_to_insert):
                job_number, _ = new_schedule[machine_index][insert_position + i]
                new_schedule[machine_index][insert_position + i] = (job_number, 0)  # Set start time to 0 for the inserted jobs

            # Step 6: Recalculate the start times after the insertion (assuming update_start_times adjusts start times accordingly)
            update_start_times(new_schedule, processing_times)

            # Calculate the new fitness
            new_fitness = evaluate(new_schedule, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)
            new_tec, new_cmax = new_fitness[1], new_fitness[0]
            delta_tec = new_tec - original_tec
            delta_cmax = new_cmax - original_cmax
            
            if delta_tec == 0 and delta_cmax == 0:
                continue

            # Check if the new solution dominates the original one
            if new_cmax <= time_horizon:
                if dominates(new_fitness, original_fitness):
                    dominating_solution = (new_schedule, new_fitness)
                    return solutions, dominating_solution
                else:
                    # Store non-dominating solutions with improvement in one objective
                    if (delta_tec < 0 and delta_cmax > 0) or (delta_cmax < 0 and delta_tec > 0):
                        solutions.append((new_schedule, new_fitness))
        
    return solutions, dominating_solution

def job_swap_on_one_machine(individual, processing_times,machines,jobs, energy_prices, energy_consumption_rates, time_periods_end, time_periods_start,time_horizon): 
    solutions = []
    dominating_solution = None

    original_fitness = evaluate(individual, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)
    original_tec, original_cmax = original_fitness[1], original_fitness[0]

    # Create a copy of the original schedule to modify
    essay = 0
     
    maxessay = round(2 + (jobs - 10) * (10 - 2) / (800 - 10))

    while essay < maxessay:
        
        essay += 1

        num_jobs_in_subsequence = random.randint(1, int(jobs/10))
     
        # Loop over each machine in the schedule
        for machine_index, machine in enumerate(individual):

            # new_schedule = [list(machine) for machine in individual]
            new_schedule = [list(machine) for machine in individual]
            
            valid_subsequences_found = False
            attempts = 0

            while not valid_subsequences_found and attempts < 10:
                # Randomly select the first subsequence starting point
                start_index1 = random.randint(0, len(machine) - num_jobs_in_subsequence)

                # Validate subsequence1
                if start_index1 + num_jobs_in_subsequence <= len(machine):
                    subsequence1 = machine[start_index1:start_index1 + num_jobs_in_subsequence]
                else:
                    attempts += 1
                    continue  # Skip if subsequence1 is invalid

                # Randomly select the second subsequence starting point
                start_index2 = random.randint(0, len(machine) - num_jobs_in_subsequence)

                # Ensure subsequences do not overlap
                if abs(start_index1 - start_index2) < num_jobs_in_subsequence:
                    attempts += 1
                    continue  # Skip if subsequences overlap

                # Validate subsequence2
                if start_index2 + num_jobs_in_subsequence <= len(machine):
                    subsequence2 = machine[start_index2:start_index2 + num_jobs_in_subsequence]
                    valid_subsequences_found = True 
                else:
                    attempts += 1
                    continue  # Skip if subsequence2 is invalid

            if not valid_subsequences_found:
                continue

            # Ensure that we don't select the same subsequence (this check is optional)
            if start_index1 == start_index2:
                continue
    
            # Swap the subsequences within the machine
            machine[start_index1:start_index1 + num_jobs_in_subsequence] = subsequence2
            machine[start_index2:start_index2 + num_jobs_in_subsequence] = subsequence1

            # Set the start times of the jobs in both subsequences to 0
            for i in range(num_jobs_in_subsequence):
                # Set start time of jobs in subsequence 1 to 0
                job_number, _ = machine[start_index1 + i]
                machine[start_index1 + i] = (job_number, 0)

                # Set start time of jobs in subsequence 2 to 0
                job_number, _ = machine[start_index2 + i]
                machine[start_index2 + i] = (job_number, 0)

            # update_start_times_local(new_schedule, processing_times, machine_index)
            update_start_times(new_schedule, processing_times)

            # Calculate the new fitness
            new_fitness = evaluate(new_schedule, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)

            new_tec, new_cmax = new_fitness[1], new_fitness[0]
            delta_tec = new_tec - original_tec
            delta_cmax = new_cmax - original_cmax
            
            if delta_tec == 0 and delta_cmax == 0:
                continue

            # Check if the new solution dominates the original one
            if new_cmax <= time_horizon:
                if dominates(new_fitness, original_fitness):
                    dominating_solution = (new_schedule, new_fitness)
                    return solutions, dominating_solution
                else:
                    # Store non-dominating solutions with improvement in one objective
                    if (delta_tec < 0 and delta_cmax > 0) or (delta_cmax < 0 and delta_tec > 0):
                        solutions.append((new_schedule, new_fitness))
            
    return solutions, dominating_solution

def job_swap_on_one_machine_logic(individual, processing_times,machines,jobs, energy_prices, energy_consumption_rates, time_periods_end, time_periods_start,time_horizon):

    solutions = []
    dominating_solution = None

    original_fitness = evaluate(individual, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)
    original_tec, original_cmax = original_fitness[1], original_fitness[0]

    # num_jobs = max(1, jobs // 10)  # Maximum value for num_jobs
    num_jobs = round(2 + (jobs - 10) * (10 - 2) / (800 - 10))
    # num_jobs = 1

    for machine_index in range(len(individual)):
        new_individual = [list(machine) for machine in individual]
        machine = new_individual[machine_index]

        if len(machine) < 2:  # Skip if there are not enough jobs to swap
            continue

        job_costs = [(job_index, total_energy_cost(new_individual, processing_times, time_periods_end, energy_prices, energy_consumption_rates, job_index, machine_index, start_time))
                        for job_index, (job_number, start_time) in enumerate(machine)]

        job_costs.sort(key=lambda x: x[1], reverse=True)  # Sort jobs by energy cost in descending order

        num_swaps = min(num_jobs, len(job_costs) - 1)  # Ensure we don't swap out of bounds
        for i in range(num_swaps):
            job1_index, _ = job_costs[i]
            job2_index, _ = job_costs[i + 1]

            # Find the actual indices of these jobs in the machine schedule
            idx1 = next(idx for idx, (job, _) in enumerate(machine) if job == job1_index)
            idx2 = next(idx for idx, (job, _) in enumerate(machine) if job == job2_index)

            # Swap the jobs using their actual indices
            machine[idx1], machine[idx2] = machine[idx2], machine[idx1]

            # Set start times of swapped jobs to 0
            machine[idx1] = (machine[idx1][0], 0)  # Reset start time
            machine[idx2] = (machine[idx2][0], 0)  # Reset start time

            # Update the start times of jobs after the swap
            update_start_times(new_individual, processing_times)

            # Calculate the new fitness
            new_fitness = evaluate(new_individual, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)
            new_tec, new_cmax = new_fitness[1], new_fitness[0]
            delta_tec, delta_cmax = new_tec - original_tec, new_cmax - original_cmax

            # If there's no improvement, revert the swap and stop further swaps
            if delta_tec == 0 and delta_cmax == 0:
                continue

            # If the new solution dominates the original one, return immediately
            if new_cmax <= time_horizon:
                if dominates(new_fitness, original_fitness):
                    dominating_solution = (new_individual, new_fitness)
                    return solutions, dominating_solution
                else:
                    if (delta_tec < 0 and delta_cmax > 0) or (delta_cmax < 0 and delta_tec > 0):
                        solutions.append((new_individual, new_fitness))

    return solutions, dominating_solution

def insert_jobs_within_machine_logic(schedule, processing_times,machines, jobs, energy_prices, energy_consumption_rates, time_periods_end, time_periods_start, time_horizon):

    sorted_periods = sorted(range(len(time_periods_start)), key=lambda i: energy_prices[i])
    
    solutions = []
    dominating_solution = None

    original_fitness = evaluate(schedule, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)
    original_tec, original_cmax = original_fitness[1], original_fitness[0]


    # num_jobs_to_insert = max(1, jobs // 10)  # Maximum value for num_jobs
    num_jobs_to_insert = num_jobs = round(2 + (jobs - 10) * (10 - 2) / (800 - 10))
    # num_jobs_to_insert = 1

    for machine_index in range(len(schedule)):
        new_schedule = [list(machine) for machine in schedule]
        selected_machine_schedule = schedule[machine_index][:]

        # **Precompute Energy Costs Once per Job**
        sorted_jobs = [
            (job[0], job[1], total_energy_cost(
                schedule, processing_times, time_periods_end, 
                energy_prices, energy_consumption_rates, 
                job[0], machine_index, job[1]
            ))  
            for job in selected_machine_schedule
        ]

        # **Sort Jobs by Energy Cost (Descending)**
        sorted_jobs.sort(key=lambda x: x[2], reverse=True)

        # **Remove the energy cost before using sorted_jobs in the loop**
        sorted_jobs = [(job[0], job[1]) for job in sorted_jobs]

        # Take only num_jobs_to_insert highest-cost jobs
        jobs_to_consider = sorted_jobs[:min(num_jobs_to_insert, len(sorted_jobs))]

        for job_number, current_start_time in jobs_to_consider:
            
            # for period_index in sorted_periods:
            new_schedule = [list(machine) for machine in schedule]

            period_index = sorted_periods[0]

            min_energy_period_start = time_periods_start[period_index]
            min_energy_period_end = time_periods_end[period_index]
            new_start_time = min_energy_period_start

            # Skip if the new position is the same as the original start time
            if new_start_time == current_start_time:
                continue

            new_schedule[machine_index] = [job for job in selected_machine_schedule if job[0] != job_number]

            insert_position = next(
                (i for i, (jn, st) in enumerate(new_schedule[machine_index]) if st >= new_start_time),
                len(new_schedule[machine_index])
            )

            jobs_to_move = [(job_number, new_start_time)]
            new_schedule[machine_index] = (
                new_schedule[machine_index][:insert_position] + jobs_to_move + new_schedule[machine_index][insert_position:]
            )
            
            update_start_times(new_schedule, processing_times)

            new_fitness = evaluate(new_schedule, processing_times, energy_consumption_rates, time_periods_end, time_periods_start, energy_prices)
            new_tec, new_cmax = new_fitness[1], new_fitness[0]
                
            delta_tec = new_tec - original_tec
            delta_cmax = new_cmax - original_cmax
            
            if delta_tec == 0 and delta_cmax == 0:
                continue


            if new_cmax <= time_horizon:
                if dominates(new_fitness, original_fitness):
                    dominating_solution = (new_schedule, new_fitness)
                    return solutions, dominating_solution
                else:
                    # Store non-dominating solutions with improvement in one objective
                    if (delta_tec < 0 and delta_cmax > 0) or (delta_cmax < 0 and delta_tec > 0):
                        solutions.append((new_schedule, new_fitness))
        
    return solutions, dominating_solution  

def VND(initial_schedule,processing_times,machines, jobs,energy_consumption_rates, time_periods_end, energy_prices, time_periods_start,time_horizon):
    local_neighborhoods = [
        insert_jobs_within_machine2,
        insert_jobs_within_machine_logic,
        job_swap_on_one_machine,
        job_swap_on_one_machine_logic,
        machine_sequence_swap_logic
    ]

   
        
    best_schedule = copy.deepcopy(initial_schedule)
    initial_fitness = evaluate(initial_schedule, processing_times, energy_consumption_rates, time_periods_end,time_periods_start, energy_prices)
    best_fitness = initial_fitness
    all_solutions = []

    for neighborhood_index, neighborhood in enumerate(local_neighborhoods):
        solutions, dominating_solution = neighborhood(
            best_schedule,processing_times,machines,jobs, energy_prices, energy_consumption_rates, time_periods_end, time_periods_start, time_horizon
        )

        if dominating_solution:
            if not is_schedule_feasible(dominating_solution[0], processing_times):
                print("dominating sol not feasible")
            best_schedule = copy.deepcopy(dominating_solution[0])
            best_fitness = dominating_solution[1]
            return best_schedule, best_fitness,all_solutions
        else:
            if solutions:
                all_solutions.extend(solutions)
    

    if len(all_solutions) == 0:
        return initial_schedule, initial_fitness, all_solutions

    selected_solution = random.choice(all_solutions)
    
    # Update best schedule
    best_schedule = copy.deepcopy(selected_solution[0])
    best_fitness = selected_solution[1]

    return best_schedule, best_fitness, all_solutions




##################################################################################
######################## NSGA-II ########################################
##################################################################################

def filter_duplicates(pareto_front):
    """
    Remove individuals with duplicate (Cmax, TEC) fitness values.
    """
    unique_fitness = set()  # Store unique (Cmax, TEC) tuples
    filtered_front = []     # Store the filtered Pareto front

    for ind in pareto_front:
        fitness = ind.fitness.values  # Get the fitness values (Cmax, TEC)
        if fitness not in unique_fitness:
            unique_fitness.add(fitness)  # Mark fitness as seen
            filtered_front.append(ind)  # Add individual to the filtered front

    return filtered_front


seen_schedules = []
seen_fitness = []

def is_duplicate(individual, fitness):
    """
    Check if the individual (schedule) is a duplicate in terms of schedule or fitness values.
    """
    cmax, tec = fitness  # Get the fitness values (Cmax and TEC)

    # Convert the individual (list of machines, each with a list of jobs/tuples) to a tuple
    individual_tuple = tuple(tuple(machine) for machine in individual)  # Nested tuple conversion

    # Check if the schedule already exists in the population
    if individual_tuple in seen_schedules:
        return True  # Duplicate schedule

    # Check if the fitness values already exist in the fitness values list
    if (cmax, tec) in seen_fitness:
        return True  # Duplicate fitness values

    return False  # No duplicates

def process_instance(instance, energy_config, consumption_config):

    machines = instance["machines"]
    jobs = instance["jobs"]
    processing_times = instance["processing_times"]
    energy_prices_data = instance["energy_prices"][energy_config]  # "6CW" or "CM"
    time_periods = energy_prices_data["end"]
    time_periods_start = energy_prices_data["start"]
    time_periods_end = energy_prices_data["end"]
    energy_prices = energy_prices_data["prices"]
    energy_consumption_rates = instance["energy_consumption_rates"][consumption_config]  # "PS" or "PB"

    print(f"len processing times : {len(processing_times[0]), len(processing_times)}")
    # Initialize genetic algorithm components
    toolbox = base.Toolbox()
    toolbox.register("individual", tools.initIterate, creator.Individual, lambda: create_individual(machines, jobs, processing_times))
    toolbox.register("population", init_population,
                 processing_times=processing_times,
                 energy_prices=energy_prices,
                 energy_consumption_rates=energy_consumption_rates,
                 size_pop= 100,
                 time_periods=time_periods,
                 time_periods_start = time_periods_start,
                 time_periods_end=time_periods_end,
                 jobs= jobs,
                 machines= machines)


    toolbox.register("mate", lambda ind1, ind2: pmx_crossover(ind1, ind2, processing_times))
    toolbox.register("mate2", lambda ind1, ind2: cxTwoPoint(ind1, ind2, machines, jobs, processing_times))
    toolbox.register("mate3", lambda ind1, ind2: uniform_crossover(ind1, ind2,machines, jobs, processing_times, energy_prices_data))
    
    toolbox.register("mutate", lambda ind: mutSwap(ind, processing_times))
    toolbox.register("mutate2", lambda ind: inversion_mutation(ind, machines, processing_times))
    toolbox.register("mutate3", lambda ind: insert_jobs_within_machine(ind,processing_times, energy_prices,energy_consumption_rates,time_periods,time_periods_start, num_jobs_to_insert=1))
    toolbox.register("mutate5", lambda ind: tec_reducer(ind, processing_times, time_periods_start, time_periods_end, energy_prices))
    toolbox.register("evaluate", lambda ind: evaluate(ind,processing_times,energy_consumption_rates,time_periods_end, time_periods_start, energy_prices))

    # 1. Initialize the population
    population = toolbox.population()
    for ind in population:
        if not ind.fitness.valid :
            ind.fitness.values = toolbox.evaluate(ind)

    explored_sol_unfiltered = population[:]  # Slice notation for lists
    # Parameters
    generations = 100
    Pc = 0.8
    Pm = 0.2
    # 1.1 Construct the first pareto front
    global_pareto_front = tools.sortNondominated(population, len(population), first_front_only=False)[0]
    cmax_values_init = [ind.fitness.values[0] for ind in global_pareto_front]
    tec_values_init = [ind.fitness.values[1] for ind in global_pareto_front]
    random_ind = population[0]
    # No improvement count
    no_improvement_count = 0
    max_no_improvement = 20  # Threshold for stopping
    gen = 0
    unchanged = True
    while (gen < generations) :

        print(f"gen : {gen}")
    
        if (gen > 0.8 * generations) and unchanged : 
            # temp = Pc 
            # Pc = Pm
            # Pm = temp
            unchanged = False
            # Pm = 0.3
            # Pc = 0.5
        # 2. Apply NSGA2 selection
        # Step 1: Apply NSGA-II selection (elitism)
        selected_nsga = tools.selNSGA2(population, len(population))
        
        # Step 2: Take only the first half of the selected list (better solutions)
        half_selected = selected_nsga[:len(selected_nsga) // 2]

        # Step 3: Clone the first half to create offspring
        offspring = list(map(toolbox.clone, half_selected))

        # Step 4: Perform Crossover & Generate New Individuals
        for i in range(0, len(offspring) - 1, 2):
            parent1 = offspring[i]
            parent2 = offspring[i + 1]
            if random.random() < Pc:  # Crossover probability
                if random.random() < 1.0:
                    child1_raw, child2_raw = toolbox.mate2(parent1, parent2)
                else : 
                    child1_raw, child2_raw = toolbox.mate4(parent1, parent2)
                # Convert raw offspring to DEAP Individuals
                child1 = creator.Individual([list(machine) for machine in child1_raw])
                child2 = creator.Individual([list(machine) for machine in child2_raw])
                
                #print(f"are the children feasible? {(is_schedule_feasible(child1,processing_times) and is_schedule_feasible(child2,processing_times))}")
                
                # Remove old fitness values (they need to be recalculated)
                del child1.fitness.values
                del child2.fitness.values

                offspring[i] = child1
                offspring[i + 1 ] = child2
                

        # 4. Mutation
        for i, mutant in enumerate(offspring):
            if random.random() < Pm :
                if random.random() <= 1.0 :
                    mutant_raw =toolbox.mutate2(mutant)
                else :
                    mutant_raw = toolbox.mutate5(mutant)

                mutant = creator.Individual([list(machine) for machine in mutant_raw])
                cmax = calculate_cmax(mutant, processing_times)
                if is_schedule_feasible(mutant,processing_times) and cmax <= time_periods_end[-1] :
                    offspring[i] = mutant
                
                del mutant.fitness.values


        for ind in offspring:
            if not ind.fitness.valid:
                ind.fitness.values = toolbox.evaluate(ind)
        
        
        sorted_by_tec = sorted(offspring, key=lambda ind: ind.fitness.values[1], reverse=True)[:10]  # Worst 10 in TEC

        #selected_individuals = sorted_by_tec
        # Apply VND to selected individuals
        selected_individuals = sorted_by_tec #tools.sortNondominated(offspring, len(offspring), first_front_only=False)[0]
        
        for mutant in selected_individuals:
            
            best_schedule, _, _ = VND(mutant,processing_times,machines, jobs,energy_consumption_rates, 
                                   time_periods_end, energy_prices, time_periods_start, time_periods_end[-1])
            
            if random.random() > 0.5 : 
                mutated_schedule = toolbox.mutate5(best_schedule)
            else : 
                mutated_schedule = best_schedule 
                
            
            cmax = calculate_cmax(mutated_schedule,processing_times)
            if is_schedule_feasible(mutated_schedule, processing_times) and cmax <= time_periods_end[-1]:
                mutant[:] = mutated_schedule[:]  # Assign only if feasible
            elif not is_schedule_feasible(mutated_schedule, processing_times):
                if is_schedule_feasible(best_schedule, processing_times) :
                    mutant[:] = best_schedule[:] 

        # 5. Combine the populations ensuring no infeasible solutions
        combined_population = population[:]
        for ind in offspring:
            ind.fitness.values = toolbox.evaluate(ind)
            fitness = ind.fitness.values
            if is_schedule_feasible(ind, processing_times) and fitness[0] <= time_periods_end[-1] :
                combined_population.append(ind)
                seen_schedules.append(tuple(tuple(machine) for machine in ind))
                seen_fitness.append(fitness)
            

        # # Evaluate fitness of the new population
        # for ind in combined_population:
        #     if not ind.fitness.valid:
        #         ind.fitness.values = toolbox.evaluate(ind)

        # Apply non-dominated sorting and crowding distance to select the best individuals for the next population
        cutoff = int(0.9 * len(population))  # 90% of the population

        # Select the top 90% best individuals using NSGA-II
        selected_top_90 = tools.selNSGA2(combined_population, cutoff)

        # Keep the worst 10% from the previous population
        #selected_worst_10 = population[cutoff:]  # Last 10% remain unchanged

        # Merge both parts to create the new population
        population[:cutoff] = selected_top_90
        explored_sol_unfiltered.extend(population)

        current_non_dominated = tools.sortNondominated(population, len(population), first_front_only=False)[0]
       
        # Extract all Cmax and TEC values from current non-dominated solutions
        cmax_values = [ind.fitness.values[0] for ind in current_non_dominated]
        tec_values = [ind.fitness.values[1] for ind in current_non_dominated]

        # Find the best (minimum) values
        #best_cmax = min(cmax_values)
        #best_tec = min(tec_values)
        global_pareto_front += current_non_dominated
        # Print the results
        #print(f"Best Cmax: {best_cmax}, Best TEC: {best_tec}")

        # Remove individuals from current_non_dominated from explored_sol_unfiltered
        explored_sol_unfiltered = [ind for ind in explored_sol_unfiltered if ind not in current_non_dominated]

        # Check for improvement
        improvement_found = False
        for new_sol in current_non_dominated:
            for existing_sol in global_pareto_front:
                if dominates(new_sol.fitness.values, existing_sol.fitness.values):
                    improvement_found = True
                    break
            if improvement_found:
                break

        if improvement_found:
            no_improvement_count = 0
        else:
            no_improvement_count += 1

        if no_improvement_count >= max_no_improvement:
            print(f"Stopping early at generation {gen} due to no improvement in the last {max_no_improvement} generations.")
            break

        # Update global pareto front
        
        #print(f"size global pareto front : {len(global_pareto_front)}")

        gen += 1


    # FINAL STEP :
    # Get the global pareto front
    for ind in global_pareto_front :
        fitness = toolbox.evaluate(ind)

    #print(f"shape of global pareto front : {len(global_pareto_front), len(global_pareto_front[0]), len(global_pareto_front[0][0])}")
    global_pareto_front = tools.sortNondominated(global_pareto_front, len(global_pareto_front), first_front_only=False)[0]
    #print(f"shape of global pareto front after NS: {len(global_pareto_front), len(global_pareto_front[0]), len(global_pareto_front[0][0])}")
    
    explored_sol_unfiltered = [ind for ind in explored_sol_unfiltered if ind not in global_pareto_front]

    # Fitler out non-feasible solutions
    filtered_front = []
    for ind in global_pareto_front:
        if is_schedule_feasible(ind, processing_times) and ind.fitness.values[0] <= time_periods_end[-1] :
            filtered_front.append(ind)
    
    

    explored_sol =[]
    for sol in explored_sol_unfiltered :
        ind.fitness.values = toolbox.evaluate(sol)
        if is_schedule_feasible(sol, processing_times) :
            explored_sol.append(sol)

    # Filter duplicates
    explored_sol = filter_duplicates(explored_sol)
    filtered_front = filter_duplicates(filtered_front)


    # Print the schedules and their fitness values
    print("\nSchedules and Fitness Values of the First Front:")
    for i, ind in enumerate(filtered_front):
        cmax, tec = ind.fitness.values
        schedule = ind[:]  # The actual schedule (list of jobs/machines)
        #print(f"Schedule {i + 1}: Cmax = {cmax}, TEC = {tec}, Schedule = {schedule}")

    # Plot the first front
    cmax_values = [ind.fitness.values[0] for ind in filtered_front]
    tec_values = [ind.fitness.values[1] for ind in filtered_front]
    print("Minimum TEC value:", min(tec_values))

    # Add all explored solutions
    cmax_values_explored = [sol.fitness.values[0] for sol in explored_sol]
    tec_values_explored = [sol.fitness.values[1] for sol in explored_sol]
    sorted_explored = sorted(zip(cmax_values_explored, tec_values_explored), key=lambda x: x[0])
    sorted_cmax_explored, sorted_tec_explored = zip(*sorted_explored)

    # Sort the values of Cmax and TEC to ensure proper line connection
    sorted_front = sorted(zip(cmax_values, tec_values), key=lambda x: x[0])  # Sorting by Cmax

    sorted_cmax, sorted_tec = zip(*sorted_front)  # Unzipping the sorted values
    sorted_front_init = sorted(zip(cmax_values_init, tec_values_init), key=lambda x: x[0])  # Sorting by Cmax
    sorted_cmax_init, sorted_tec_init = zip(*sorted_front_init)  # Unzipping the sorted values

    return sorted_cmax, sorted_tec, sorted_cmax_init, sorted_tec_init, sorted_cmax_explored, sorted_tec_explored




##################################################################################
######################## TESTS ###################################################
##################################################################################


import time
import csv 
from multiprocessing import Process
from multiprocessing import set_start_method

def save_pareto_front2(cmax_values, tec_values, num_machines, num_jobs, config_type,instance_idx, exec_time, save_dir):
    # Create the output directory if it doesn't exist
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    # Define the full file path with the desired directory
    
    filename = os.path.join(save_dir, f"M{num_machines}_J{num_jobs}_config_{config_type}_{instance_idx}.csv")

    # Open the CSV file in write mode
    with open(filename, mode="w", newline="") as file:
        writer = csv.writer(file)

        # Write the header
        writer.writerow(["Makespan", "TEC"])

        # Write the Pareto front data along with execution time
        for cmax, tec in zip(cmax_values, tec_values):
            writer.writerow([float(cmax), float(tec)])  # Convert to native float type

    print(f"Pareto front for Instance {num_machines}, {num_jobs} with configuration {config_type} saved to {filename}.")

# Save global pareto front and explored solutions in a seperate file
def save_pareto_front(cmax_values, tec_values, cmax_explored, tec_explored, num_machines, num_jobs, config_type, instance_idx, exec_time, save_dir):
    import os
    import csv

    # Create the output directory if it doesn't exist
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    # Define the full file path with the desired directory
    filename = os.path.join(save_dir, f"M{num_machines}_J{num_jobs}_config_{config_type}_{instance_idx}.csv")

    # Combine the explored solutions into a single list of tuples for comparison
    explored_solutions = list(zip(cmax_explored, tec_explored))
    pareto_solutions = set(zip(cmax_values, tec_values))  # Use a set for fast lookup

    # Open the CSV file in write mode
    with open(filename, mode="w", newline="") as file:
        writer = csv.writer(file)

        # Write the header
        writer.writerow(["Makespan", "TEC", "Pareto", "Exec_time"])
        
        for cmax, tec in zip(cmax_values, tec_values):
            # All Pareto front solutions will be marked as 'true'
            writer.writerow([float(cmax), float(tec), "true", float(exec_time)])
            
        # Write the explored solutions with their Pareto status
        for cmax, tec in explored_solutions:
            # All explored solutions will be marked as 'false'
            writer.writerow([float(cmax), float(tec), "false", float(exec_time)])




def process_instance_parallel(instance, instance_idx, config_type, batch_dir, batch_dir2):
    """
        Function to wrap the processing and saving of an instance 
    """
    print(f"Processing Instance {instance_idx} with {instance['machines']} machines and {instance['jobs']} jobs (Config: {config_type}).")
    start_time = time.time()  # Start timer
    cmax_values, tec_values, cmax_init_values, cmax_tec_values, cmax_explored, tec_explored = process_instance(
        instance, "6CW", config_type
    )
    exec_time = time.time() - start_time  # Calculate execution time

    # Save results
    save_pareto_front(cmax_values, tec_values, cmax_explored, tec_explored, instance['machines'], instance['jobs'], config_type, instance_idx, exec_time, save_dir=batch_dir)
    save_pareto_front2(cmax_init_values, cmax_tec_values, instance['machines'], instance['jobs'], config_type, instance_idx, exec_time, save_dir=batch_dir2)



import cProfile
import pstats
import io
import os
from multiprocessing import Process
def profile_process_instance_parallel(*args, **kwargs):
    """Wrapper function to profile `process_instance_parallel`."""
    profiler = cProfile.Profile()
    profiler.enable()
    process_instance_parallel(*args, **kwargs)
    profiler.disable()

    # Save profiling results for this process
    output = io.StringIO()
    stats = pstats.Stats(profiler, stream=output)
    stats.strip_dirs().sort_stats('time').print_stats()
    # print(f"Profiling results for process {os.getpid()}:")
    # print(output.getvalue())

if __name__ == "__main__":
    # Initialize the profiler for the main process
    profiler = cProfile.Profile()
    profiler.enable()

    # Mocked `load_instances` function; replace with your actual logic.
    base_dir = "./new_data"  # Replace with your actual base directory
    num_jobs = 800  # Replace with actual number of jobs
    machines_list = [5, 10, 15, 20, 40, 60]  # Replace with actual machine list
    num_instances = 10  # Replace with actual number of instances

    instances_data = load_instances(base_dir, num_jobs, machines_list, num_instances)
    
    # Define the instance types
    instance_types = [
        {"machines": 60, "jobs": 800}
    ]

    for instance_type in instance_types:
        print(f"Processing instances of type: {instance_type['machines']} machines, {instance_type['jobs']} jobs.")

        # Filter instances of the current type
        instances_of_type = [
            instance for instance in instances_data
            if instance["machines"] == instance_type["machines"] and instance["jobs"] == instance_type["jobs"]
        ][0:10]

        batch_dir = "pareto_outputs_parallel"  # Directory to save results
        batch_dir2 = "pareto_outputs_parallel_alone"
        os.makedirs(batch_dir, exist_ok=True)
    
        processes = []  # Store process objects
        for instance_idx, instance in enumerate(instances_of_type):
            for config_type in ["PS"]:  # Test with both configurations
                # Use the profiled wrapper function
                p = Process(target=profile_process_instance_parallel, args=(instance, instance_idx, config_type, batch_dir, batch_dir2))
                p.start()
                processes.append(p)

            # Limit the number of concurrent processes 
            if len(processes) >= os.cpu_count():
                for p in processes:
                    p.join()  # Wait for current batch to finish
                processes = []

        # Ensure remaining processes complete
        for p in processes:
            p.join()

    # Disable the profiler for the main process
    profiler.disable()

    # Output the profiling results for the main process
    # output = io.StringIO()
    # stats = pstats.Stats(profiler, stream=output)
    # stats.strip_dirs().sort_stats('time').print_stats()
    # print("Profiling results for the main process:")
    # print(output.getvalue())
    # stats.print_callers()

    print("Processing complete.")
